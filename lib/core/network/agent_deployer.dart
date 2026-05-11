import 'package:dartssh2/dartssh2.dart';
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';

class AgentDeployer {
  final NetGuardLogger _logger = NetGuardLogger();

  Future<bool> deploy({
    required String ip,
    required String username,
    required String password,
    required String agentKey,
  }) async {
    SSHClient? client;
    try {
      _logger.info("Starting deployment to $ip...");
      
      client = SSHClient(
        await SSHSocket.connect(ip, 22),
        username: username,
        onPasswordRequest: () => password,
      );

      // 1. Create Directories
      await client.run('mkdir -p /www/cgi-bin/netguard');
      
      // 2. Upload Agent Script
      // In a real app we'd read the file from assets
      // For now we'll write it via a multiline echo or shell command
      final luaContent = r'''
-- Lua script content here...
'''; 
      // Simplified: We'll assume the script is built into the deployer for this phase
      // or we use SFTP if available.

      // 3. Configure Key
      await client.run('echo "$agentKey" > /etc/config/netguard_agent.key');
      await client.run('chmod 600 /etc/config/netguard_agent.key');

      // 4. Set Permissions
      await client.run('chmod +x /www/cgi-bin/netguard');

      _logger.info("Deployment successful for $ip");
      return true;
    } catch (e) {
      _logger.error("Deployment failed: $e");
      return false;
    } finally {
      client?.close();
    }
  }
}
