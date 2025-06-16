---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: Dog HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/dog_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["linux", "git", "backdropcms", "cms", "bee"]
languages: []
---

### SUMMARY
The machine has two open ports, one exposing a .git directory via HTTP. Using git-dumper, we retrieved files containing database credentials and a valid user. With these credentials, we accessed the Backdrop CMS admin panel (version 1.27). Using an exploit from Searchsploit, we uploaded a malicious module to execute commands.
The modules directory allowed directory listing, so we confirmed our shell upload and gained system access. Inside, we found two users and successfully logged in as johncusack, who has sudo rights to run the bee binary. This allowed us to run PHP commands and set the SUID bit on /bin/bash, spawning a root shell.

### NMAP
- Nmap scan report
	```
	# Nmap 7.95 scan initiated Tue May 27 15:08:05 2025 as: /usr/lib/nmap/nmap --privileged -sCV -p22,80 -oN targeted 10.10.11.58
	Nmap scan report for 10.10.11.58
	Host is up (0.28s latency).
	
	PORT   STATE SERVICE VERSION
	22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.12 (Ubuntu Linux; protocol 2.0)
	| ssh-hostkey: 
	|   3072 97:2a:d2:2c:89:8a:d3:ed:4d:ac:00:d2:1e:87:49:a7 (RSA)
	|   256 27:7c:3c:eb:0f:26:e9:62:59:0f:0f:b1:38:c9:ae:2b (ECDSA)
	|_  256 93:88:47:4c:69:af:72:16:09:4c:ba:77:1e:3b:3b:eb (ED25519)
	80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
	| http-git: 
	|   10.10.11.58:80/.git/
	|     Git repository found!
	|     Repository description: Unnamed repository; edit this file 'description' to name the...
	|_    Last commit message: todo: customize url aliases.  reference:https://docs.backdro...
	|_http-generator: Backdrop CMS 1 (https://backdropcms.org)
	|_http-title: Home | Dog
	|_http-server-header: Apache/2.4.41 (Ubuntu)
	| http-robots.txt: 22 disallowed entries (15 shown)
	| /core/ /profiles/ /README.md /web.config /admin 
	| /comment/reply /filter/tips /node/add /search /user/register 
	|_/user/password /user/login /user/logout /?q=admin /?q=comment/reply
	Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
	
	Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
	# Nmap done at Tue May 27 15:08:31 2025 -- 1 IP address (1 host up) scanned in 26.45 seconds
	```
### FOOTHOLD
- We found a .git directory on the website using nmap.
	![alt](/images/posts/dog3.webp)
- We use git-dumper to restore the files to our victim machine, and upon accessing them, we find database credentials.
	```
		git-dumper http://10.10.11.58/.git DUMP
	```
	![alt](/images/posts/dog4.webp)
- While doing more enumeration, we also found a user. This search was a bit more detailed. Here, it’s important to use keywords like mail(s), databases, or the domain in our recursive searches.
	![alt](/images/posts/dog5.webp)
- We have valid credentials and a user, so we will access the login panel found on the website.
	![alt](/images/posts/dog6.webp)
- We successfully accessed the administrative panel by providing the credentials.
	![alt](/images/posts/dog7.webp)
- By listing the modules, we were able to see the CMS version.
	![alt](/images/posts/dog8.webp)
- Using Searchsploit, we found an exploit that creates a folder with malicious files which we will need to upload as modules.
	![alt](/images/posts/dog.webp)
- We ran the script, and it created a directory and a zip file called shell.
	![alt](/images/posts/dog9.webp)
- The shell folder that was created will be compressed into a tar archive because when we tried uploading the zip file, it required a tar.gz file, and when we tried uploading the tar.gz, it didn’t work.
	![alt](/images/posts/dog10.webp)
- We uploaded the tar file to the location specified by the script.
	![alt](/images/posts/dog11.webp)
- Once uploaded, this tab/window appeared.
	![alt](/images/posts/dog12.webp)
- We navigated to the modules directory and found our file.
	![alt](/images/posts/dog13.webp)
- We were able to execute commands.
	![alt](/images/posts/dog14.webp)
- We sent a reverse shell to our Kali machine.
	![alt](/images/posts/dog2.webp)
### USER PIVOTING
- Listing users, we found that there are two.
	![alt](/images/posts/dog15.webp)
- Since we have valid credentials, we tried to use them with the users, and the credentials were valid for the user johncusack.
	![alt](/images/posts/dog16.webp)
### LOCAL
```
	bash-5.0$ whoami && ifconfig && cat user.txt 
johncusack
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.10.11.58  netmask 255.255.254.0  broadcast 10.10.11.255
        inet6 dead:beef::250:56ff:fe94:337b  prefixlen 64  scopeid 0x0<global>
        inet6 fe80::250:56ff:fe94:337b  prefixlen 64  scopeid 0x20<link>
        ether 00:50:56:94:33:7b  txqueuelen 1000  (Ethernet)
        RX packets 109317  bytes 10263445 (10.2 MB)
        RX errors 0  dropped 16  overruns 0  frame 0
        TX packets 105585  bytes 36728587 (36.7 MB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 51683  bytes 48527451 (48.5 MB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 51683  bytes 48527451 (48.5 MB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

b43316f116f60cd22c47d6235b9df83b
```
### PRIVILEGE ESCALATION
- When listing sudoers permissions, we found that the user can execute the binary bee.
	![alt](/images/posts/dog17.webp)
- With this, we changed the permission of the bash binary to SUID.
	![alt](/images/posts/dog18.webp)
### ROOT
```
		bash-5.0# whoami && ifconfig && cat /root/root.txt
	root
	eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
	        inet 10.10.11.58  netmask 255.255.254.0  broadcast 10.10.11.255
	        inet6 dead:beef::250:56ff:fe94:337b  prefixlen 64  scopeid 0x0<global>
	        inet6 fe80::250:56ff:fe94:337b  prefixlen 64  scopeid 0x20<link>
	        ether 00:50:56:94:33:7b  txqueuelen 1000  (Ethernet)
	        RX packets 109266  bytes 10259947 (10.2 MB)
	        RX errors 0  dropped 16  overruns 0  frame 0
	        TX packets 105552  bytes 36725274 (36.7 MB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
	        inet 127.0.0.1  netmask 255.0.0.0
	        inet6 ::1  prefixlen 128  scopeid 0x10<host>
	        loop  txqueuelen 1000  (Local Loopback)
	        RX packets 51603  bytes 48521771 (48.5 MB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 51603  bytes 48521771 (48.5 MB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	894f32e800fd778a98888d9ab34da608
```