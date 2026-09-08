require 'json'
require 'net/http'
require 'open3'
require 'socket'
require 'tmpdir'

binary = File.expand_path(ARGV.fetch(0))
entrypoint = File.expand_path(ARGV.fetch(1, File.join(__dir__, '..', 'docker-entrypoint.sh')))

def free_port
  socket = TCPServer.new('127.0.0.1', 0)
  port = socket.addr[1]
  socket.close
  port
end

Dir.mktmpdir('datum-web-config-') do |dir|
  api_port = free_port
  password = 'dashboard-config-test'
  pool = TCPServer.new('127.0.0.1', 0)
  pool_port = pool.addr[1]
  key = 'ab' * 64
  script = File.read(entrypoint)
    .sub('DATA_DIR=/data', "DATA_DIR='#{dir}'")
    .sub('exec /app/datum_gateway --config "$DATA_DIR/config.json"', 'exit 0')
    .sub('"listen_port": 7152', "\"listen_port\": #{api_port}")
    .sub('"listen_port": 23334', "\"listen_port\": #{free_port}")
    .gsub('0.0.0.0', '127.0.0.1')
  entrypoint_path = File.join(dir, 'entrypoint.sh')
  config_path = File.join(dir, 'config.json')
  log_path = File.join(dir, 'gateway.log')
  File.write(entrypoint_path, script)
  env = ENV.to_h.reject { |name, _| name.start_with?('DATUM_') }.merge(
    'DATUM_DASHBOARD_ADMIN_PASSWORD' => password,
    'DATUM_RPC_USER' => 'test',
    'DATUM_RPC_PASSWORD' => 'test',
  )
  generate = lambda do
    _, error, status = Open3.capture3(env, 'sh', entrypoint_path, "127.0.0.1:#{free_port}", unsetenv_others: true)
    raise error unless status.success?
  end
  request = lambda do |fields = nil, secret = password|
    message = fields ? Net::HTTP::Post.new('/config') : Net::HTTP::Get.new('/config')
    message.set_form_data(fields) if fields
    message.basic_auth('admin', secret) if secret
    Net::HTTP.start('127.0.0.1', api_port, open_timeout: 1, read_timeout: 2) { |http| http.request(message) }
  end
  wait_page = lambda do
    result = nil
    100.times do
      begin
        response = request.call
        token = response.body[/name='csrf' value='([^']+)'/, 1]
        if response.code == '200' && token
          result = [response, token]
          break
        end
      rescue Errno::ECONNREFUSED, Errno::ECONNRESET, EOFError
      end
      sleep 0.1
    end
    raise "Dashboard did not start or restart: #{File.read(log_path)}" unless result
    result
  end
  generate.call
  pid = Process.spawn(binary, '--config', config_path, out: log_path, err: [:child, :out], umask: 0o077)
  begin
    response, token = wait_page.call
    raise 'Configuration remains locked' if response.body.include?('Config file disallows editing')
    %w[datum_pool_host datum_pool_port datum_pool_pubkey stratum_vardiff_min stratum_vardiff_target_shares_min].each do |name|
      field = response.body[/<input\b[^>]*name="#{name}"[^>]*>/]
      raise "Missing or locked #{name}" unless field && !field.match?(/\b(?:readonly|disabled)\b/)
    end
    original = File.read(config_path)
    payload = { 'checkboxes' => '', 'csrf' => token, 'datum_pool_port' => pool_port.to_s }
    raise 'Unauthenticated write accepted' unless request.call(payload, nil).code == '401'
    raise 'Wrong password accepted' unless request.call(payload, 'wrong').code == '401'
    raise 'Missing CSRF accepted' unless request.call(payload.reject { |name, _| name == 'csrf' }).code == '403'
    raise 'Wrong CSRF accepted' unless request.call(payload.merge('csrf' => 'wrong')).code == '403'
    raise 'Unauthorized request changed config' unless File.read(config_path) == original
    [
      ['datum_pool_pubkey', 'bad-key', '128 hexadecimal characters'],
      ['stratum_vardiff_min', '4095', 'power of two'],
      ['stratum_vardiff_target_shares_min', '0', 'between 1 and 120'],
    ].each do |name, value, error|
      response = request.call('checkboxes' => '', 'csrf' => token, name => value)
      raise "Invalid #{name} accepted" unless response.body.include?(error)
      raise "Invalid #{name} changed config" unless File.read(config_path) == original
    end
    response = request.call(
      'checkboxes' => '', 'csrf' => token,
      'reward_sharing' => 'require',
      'datum_pool_host' => '127.0.0.1', 'datum_pool_port' => pool_port.to_s,
      'datum_pool_pubkey' => key, 'username_behaviour' => 'datum_pool_pass_full_users',
      'stratum_vardiff_min' => '4096', 'stratum_vardiff_target_shares_min' => '8',
    )
    raise "Save failed: #{response.body}" unless response.code == '302'
    raise 'Pool connection was not attempted' unless IO.select([pool], nil, nil, 10)
    pool.accept.close
    response, token = wait_page.call
    configured = JSON.parse(File.read(config_path))
    raise 'Pool settings were not saved' unless configured['datum'].values_at('pool_host', 'pool_port', 'pool_pubkey', 'pooled_mining_only', 'pool_pass_full_users') == ['127.0.0.1', pool_port, key, true, true]
    raise 'Difficulty was not saved' unless configured['stratum'].values_at('vardiff_min', 'vardiff_target_shares_min') == [4096, 8]

    Process.kill('TERM', pid)
    Process.wait(pid)
    pid = nil
    generate.call # A full package restart with the old, solo environment.
    raise 'Package restart discarded pool settings' unless JSON.parse(File.read(config_path))['datum'] == configured['datum']
    pid = Process.spawn(binary, '--config', config_path, out: log_path, err: [:child, :out], umask: 0o077)
    response, = wait_page.call
    raise 'Reloaded panel lost pool mode' unless response.body.match?(/value="require" selected/)
    raise 'Reloaded panel lost difficulty' unless response.body.match?(/name="stratum_vardiff_min"[^>]*value="4096"/)
  ensure
    Process.kill('TERM', pid) rescue Errno::ESRCH if pid
    Process.wait(pid) rescue Errno::ECHILD if pid
    pool.close
  end
end
puts 'Dashboard config: authenticated edits, CSRF, validation, pool connection attempt, and restart persistence passed'
