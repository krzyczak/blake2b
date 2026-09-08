require 'json'
require 'net/http'
require 'socket'
require 'tmpdir'

binary = File.expand_path(ARGV.fetch(0))
def free_port
  socket = TCPServer.new('127.0.0.1', 0)
  port = socket.addr[1]
  socket.close
  port
end

Dir.mktmpdir('datum-auth-') do |dir|
  ['test-dashboard-password', ''].each_with_index do |password, index|
    port = free_port
    config = {
      bitcoind: { rpcurl: "http://127.0.0.1:#{free_port}", rpcuser: 'test', rpcpassword: 'test' },
      stratum: { listen_addr: '127.0.0.1', listen_port: free_port, vardiff_min: 1 },
      mining: { pool_address: 'mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn' },
      api: { listen_addr: '127.0.0.1', listen_port: port, admin_password: password, modify_conf: false },
      logger: { log_to_console: true, log_to_file: false },
      datum: { pool_host: '', pooled_mining_only: false },
    }
    path = File.join(dir, "config-#{index}.json")
    log_path = File.join(dir, "gateway-#{index}.log")
    File.write(path, JSON.generate(config))
    pid = Process.spawn(binary, '--config', path, out: log_path, err: [:child, :out])
    begin
      request = lambda do |user = nil, secret = nil|
        message = Net::HTTP::Get.new('/threads')
        message.basic_auth(user, secret) if user
        Net::HTTP.start('127.0.0.1', port, open_timeout: 1, read_timeout: 2) { |http| http.request(message) }
      end
      response = nil
      100.times do
        begin
          response = request.call
          break
        rescue Errno::ECONNREFUSED, Errno::ECONNRESET, EOFError
          sleep 0.1
        end
      end
      raise "Dashboard did not start: #{File.read(log_path)}" unless response
      raise 'Missing Basic challenge' unless response.code == '401' && response['www-authenticate'].start_with?('Basic ')
      raise 'Wrong password accepted' unless request.call('admin', 'wrong-password').code == '401'
      raise 'Wrong user accepted' unless request.call('other', password).code == '401'
      expected = password.empty? ? '401' : '200'
      raise 'Admin authentication failed' unless request.call('admin', password).code == expected
    ensure
      Process.kill('TERM', pid) rescue Errno::ESRCH
      Process.wait(pid) rescue Errno::ECHILD
    end
  end
end
puts 'Dashboard auth: Basic challenge, valid login, wrong credentials, and empty password passed'
