import paramiko


class SSHLinux():
    # def __init__(self, hostname, port, username, password):
    #     # 创建sshClient实例对象
    #     ssh = paramiko.SSHClient()
    #     # 设置信任远程机器，允许访问
    #     ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    #     self.ssh = ssh
    #     self.ssh.connect(hostname, port=port, username=username, password=password)
    def __init__(self,hostname,port,username,keys):
        key = paramiko.RSAKey.from_private_key_file(keys)
        ssh = paramiko.SSHClient()

        # 创建sshClient实例对象
        ssh = paramiko.SSHClient()
        # 设置信任远程机器，允许访问
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.ssh = ssh
        self.ssh.connect(hostname, port=port, username=username, pkey=key)

    def use_command(self, cmd):
        try:
            """
            stdin  标准格式的输入，是一个写权限的文件对象
			stdout 标准格式的输出，是一个读权限的文件对象
			stderr 标准格式的错误，是一个写权限的文件对象”
			执行命令会返回三个对象，调用一次exec_command方法就相当于重新打开一次linux终端
			"""

            stdin, stdout, stderr = self.ssh.exec_command(cmd)
            res = stdout.read().decode()
            return res
        except Exception as e:
            print(e)
        finally:
            self.ssh.close()


# hostname = "jumps.micoworld.net"
# port = 2222
# username = "longduo"
# password = "liuhonglian19930"

r = 'D:\code\event\data\longduo-jumpserver.pem'

hostname = "47.241.121.1"
port = 22
username = "longduo@micous.com"
password = "longduo@jumpserver"

ssh = SSHLinux(hostname, port=port, username=username,keys=r)
print(ssh.use_command("ll"))