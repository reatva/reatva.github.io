---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: Codify HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/codify_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["linux", "machine", "hackthebox", "oscp"]
languages: []
---

### SUMMARY:
- In this machine we found a http service that seems to be running a vulnerable JavaScript (JS) library known as vm2 which version is 3.9. From here we can execute commands to escape the sandbox and gain access to the system as the user svc. Inside as the user svc when enumerating I found Joshua hash which I cracked finding his password in clear text. As Joshua I had the privilege to execute a custom script that when reading it wasn't sanitizing the input, knowing that the input wasn't being sanitize nor compare properly I could use a wildcard to bypass the input and since the script was doing a backup and using roots credential to connect to the database I used another console to capture the password in clear text using pspy and since the password was root's password I was able to connect to the machine as the user root.

### NMAP
- Nmap scan report
	```
	# Nmap 7.95 scan initiated Thu May  1 14:41:16 2025 as: /usr/lib/nmap/nmap --privileged -sCV -p22,80,3000 -oN targeted 10.10.11.239
	Nmap scan report for 10.10.11.239
	Host is up (0.28s latency).
	
	PORT     STATE SERVICE VERSION
	22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.4 (Ubuntu Linux; protocol 2.0)
	| ssh-hostkey: 
	|   256 96:07:1c:c6:77:3e:07:a0:cc:6f:24:19:74:4d:57:0b (ECDSA)
	|_  256 0b:a4:c0:cf:e2:3b:95:ae:f6:f5:df:7d:0c:88:d6:ce (ED25519)
	80/tcp   open  http    Apache httpd 2.4.52
	|_http-server-header: Apache/2.4.52 (Ubuntu)
	|_http-title: Did not follow redirect to http://codify.htb/
	3000/tcp open  http    Node.js Express framework
	|_http-title: Codify
	Service Info: Host: codify.htb; OS: Linux; CPE: cpe:/o:linux:linux_kernel
	
	Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
	# Nmap done at Thu May  1 14:41:45 2025 -- 1 IP address (1 host up) scanned in 28.57 seconds
	```
### FOOTHOLD
- We found a http server running on port 80
	![alt](/images/posts/codify.webp)
- When reading the about section I found a clue about what the server is implementing which seems to be the vm2 library from Javascript
	![alt](/images/posts/codify2.webp)
- Investigating for exploits about that library I found a resource on github 
	![alt](/images/posts/codify3.webp)
- Back on the codify.htb webpage I found an editor field where I could introduce Javascript code
	![alt](/images/posts/codify4.webp)
- I then used github payload into the editor and was able to execute commands by receving a ping
	![alt](/images/posts/codify5.webp)
	![alt](/images/posts/codify6.webp)
- I then send a revershell and gained access as the user svc, after enumerating the system I was able to find joshuas hash 
	![alt](/images/posts/codify7.webp)
- I then cracked joshuas hash and found his password in clear text
	![alt](/images/posts/codify8.webp)	
### LOCAL
- I connected using SSH as joshua and read the user flag
	```
	joshua@codify:~$ whoami ; ifconfig; cat /home/joshua/user.txt
	joshua
	
	eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
	        inet 10.10.11.239  netmask 255.255.254.0  broadcast 10.10.11.255
	        inet6 dead:beef::250:56ff:fe94:d69c  prefixlen 64  scopeid 0x0<global>
	        inet6 fe80::250:56ff:fe94:d69c  prefixlen 64  scopeid 0x20<link>
	        ether 00:50:56:94:d6:9c  txqueuelen 1000  (Ethernet)
	        RX packets 115268  bytes 14383369 (14.3 MB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 112221  bytes 22496012 (22.4 MB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
	        inet 127.0.0.1  netmask 255.0.0.0
	        inet6 ::1  prefixlen 128  scopeid 0x10<host>
	        loop  txqueuelen 1000  (Local Loopback)
	        RX packets 84455  bytes 40673976 (40.6 MB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 84455  bytes 40673976 (40.6 MB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	4d3a714a181119f9739505aa38c4fd78
	```
### PRIVILEGE ESCALATION
- As the user joshua I was able to run a custom script as the user root
	![alt](/images/posts/codify9.webp)
- I read the content of the file and found that the double brackets weren't using double quotes when comparing strings, leading to being able to use a wildcard as input in order to bypass it
	![alt](/images/posts/codify10.webp)
- Since the script was using root's password I decide to use pspy to capture the process when using the wildcard (\*) and I was able to find root's credential in clear text
	![alt](/images/posts/codify11.webp)
	![alt](/images/posts/codify12.webp)
### ROOT
- I then use SSH to connect as the user too ibtaining the root flag
	```
	root@codify:/home/joshua# whoami ; ifconfig ; cat /root/root.txt
	root
	
	eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
	        inet 10.10.11.239  netmask 255.255.254.0  broadcast 10.10.11.255
	        inet6 dead:beef::250:56ff:fe94:d69c  prefixlen 64  scopeid 0x0<global>
	        inet6 fe80::250:56ff:fe94:d69c  prefixlen 64  scopeid 0x20<link>
	        ether 00:50:56:94:d6:9c  txqueuelen 1000  (Ethernet)
	        RX packets 115931  bytes 14435687 (14.4 MB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 112589  bytes 22541081 (22.5 MB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
	        inet 127.0.0.1  netmask 255.0.0.0
	        inet6 ::1  prefixlen 128  scopeid 0x10<host>
	        loop  txqueuelen 1000  (Local Loopback)
	        RX packets 89366  bytes 47177433 (47.1 MB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 89366  bytes 47177433 (47.1 MB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	d145b842b28c1987f79cc63e5a2feb30
	```