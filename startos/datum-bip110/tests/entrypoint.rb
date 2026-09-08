require 'json'
require 'tmpdir'
require 'open3'

root = File.expand_path('..', __dir__)
Dir.mktmpdir('datum-entrypoint-') do |dir|
  script = File.read(File.join(root, 'docker-entrypoint.sh'))
  # Redirect only container paths; execute the production config generator.
  script.sub!('DATA_DIR=/data', "DATA_DIR='#{dir}'")
  script.sub!('exec /app/datum_gateway --config "$DATA_DIR/config.json"', 'exit 0')
  path = File.join(dir, 'entrypoint.sh')
  File.write(path, script)
  env = ENV.to_h.reject { |key, _| key.start_with?('DATUM_') }.merge(
    'DATUM_RPC_USER' => 'rpc-user',
    'DATUM_RPC_PASSWORD' => "password\"\\\nvalue",
    'DATUM_DASHBOARD_ADMIN_PASSWORD' => 'dashboard-test-password',
  )
  run = lambda do |changes|
    _, stderr, status = Open3.capture3(env.merge(changes), 'sh', path, '127.0.0.1:8332', unsetenv_others: true)
    [status.success?, stderr]
  end
  success, error = run.call({})
  raise error unless success
  config_path = File.join(dir, 'config.json')
  solo = JSON.parse(File.read(config_path))
  raise 'Solo defaults changed' unless solo.dig('datum', 'pool_host') == '' && solo.dig('stratum', 'vardiff_min') == 1
  raise 'RPC escaping changed' unless solo.dig('bitcoind', 'rpcpassword') == env['DATUM_RPC_PASSWORD']
  raise 'Legacy PoW option remains' if solo['mining'].key?('pow_algorithm')
  raise 'Dashboard editing is disabled' unless solo.dig('api', 'modify_conf') && solo.dig('api', 'admin_password') == env['DATUM_DASHBOARD_ADMIN_PASSWORD']
  raise 'Unsafe config mode' unless File.stat(config_path).mode & 0o777 == 0o600
  pool_env = {
    'DATUM_POOL_HOST' => 'stratum.abc.xyz',
    'DATUM_POOL_PORT' => '28915',
    'DATUM_POOL_PUBKEY' => 'ab' * 64,
    'DATUM_POOL_PASS_WORKERS' => 'true',
    'DATUM_POOL_PASS_FULL_USERS' => 'true',
    'DATUM_POOLED_MINING_ONLY' => 'true',
    'DATUM_VARDIFF_MIN' => '4096',
    'DATUM_VARDIFF_TARGET_SHARES_MIN' => '8',
  }
  File.unlink(config_path)
  success, error = run.call(pool_env)
  raise error unless success
  configured = File.read(config_path)
  pool = JSON.parse(configured)
  raise 'Pool mapping failed' unless pool['datum'] == {
    'pool_host' => 'stratum.abc.xyz', 'pool_port' => 28915, 'pool_pubkey' => 'ab' * 64,
    'pool_pass_workers' => true, 'pool_pass_full_users' => true, 'pooled_mining_only' => true,
  }
  raise 'Difficulty mapping failed' unless pool.dig('stratum', 'vardiff_min') == 4096
  [
    { 'DATUM_POOL_PUBKEY' => 'z' * 128 },
    { 'DATUM_POOL_PORT' => '65536' },
    { 'DATUM_VARDIFF_MIN' => '4095' },
    { 'DATUM_POOL_PASS_WORKERS' => 'not-a-boolean' },
    { 'DATUM_VARDIFF_TARGET_SHARES_MIN' => '0' },
    { 'DATUM_POOL_HOST' => '' },
  ].each do |invalid|
    success, = run.call(pool_env.merge(invalid))
    raise "Accepted #{invalid}" if success
    raise 'Invalid input overwrote config' unless File.read(config_path) == configured
  end
  pool['datum']['pool_host'] = 'web-edited.example'
  pool['datum']['pool_port'] = 30000
  pool['datum']['pool_pubkey'] = 'cd' * 64
  pool['datum']['pool_pass_full_users'] = false
  pool['datum']['always_pay_self'] = true
  pool['stratum']['vardiff_min'] = 8192
  pool['stratum']['vardiff_target_shares_min'] = 12
  pool['mining']['pool_address'] = 'n2eMqTT929pb1RDNuqEnxdaLau1rxy3efi'
  pool['mining']['coinbase_tag_secondary'] = 'Web identity'
  pool['mining']['allow_hasher_time_rolling'] = false
  pool['bitcoind']['work_update_seconds'] = 40
  pool['api']['modify_conf'] = false # Upgrade an existing read-only config.
  File.write(config_path, JSON.generate(pool))
  success, error = run.call({})
  raise error unless success
  saved = JSON.parse(File.read(config_path))
  raise 'Upgrade did not unlock web editing' unless saved.dig('api', 'modify_conf')
  %w[datum stratum mining].each do |section|
    raise "Restart discarded web #{section} settings" unless saved[section] == pool[section]
  end
  raise 'Job interval was discarded' unless saved.dig('bitcoind', 'work_update_seconds') == 40
  success, error = run.call(pool_env.merge('DATUM_RPC_COOKIE_FILE' => '/mnt/bitcoin/.cookie'))
  raise error unless success
  cookie = JSON.parse(File.read(config_path))['bitcoind']
  raise 'Cookie auth mapping failed' unless cookie['rpccookiefile'] == '/mnt/bitcoin/.cookie' && !cookie.key?('rpcpassword')
  success, error = run.call('DATUM_RPC_PASSWORD' => 'rotated-rpc', 'DATUM_DASHBOARD_ADMIN_PASSWORD' => 'rotated-dashboard')
  raise error unless success
  saved = JSON.parse(File.read(config_path))
  raise 'RPC credentials did not refresh' unless saved.dig('bitcoind', 'rpcpassword') == 'rotated-rpc' && !saved['bitcoind'].key?('rpccookiefile')
  raise 'Dashboard credentials did not refresh' unless saved.dig('api', 'admin_password') == 'rotated-dashboard'
  saved['datum']['pool_host(old)'] = saved['datum']['pool_host']
  saved['datum']['pool_host'] = ''
  saved['datum']['pooled_mining_only'] = false
  File.write(config_path, JSON.generate(saved))
  success, error = run.call(pool_env)
  raise error unless success
  raise 'Restart re-enabled the disabled pool' unless JSON.parse(File.read(config_path)).dig('datum', 'pool_host') == ''
  File.write(config_path, '{broken')
  success, = run.call({})
  raise 'Invalid saved JSON was ignored or overwritten' if success || File.read(config_path) != '{broken'
end
puts 'Entrypoint: editable dashboard, persistent settings, validation, and refreshed credentials passed'
