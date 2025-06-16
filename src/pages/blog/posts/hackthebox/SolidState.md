---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: SolidState HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/solidstate_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["linux", "machine", "offsec", "hackthebox"]
languages: []
---

### SUMMARY
>This machine has a few open ports, however our focus go into James Server 2.3.2 reported by nmap scan. When investigating about it I found a RCE exploit, however for this exploit to work it needs to be trigger by a SSH connection so we leve it in standby. On the other hand, I was able to connect to James Server trough port 4555 by using root default credentials (root:root) here I was able to change a user password. After changing Mindy's password I tried to connect to port 110 and I was able to do it successfully with the password I changed. Here I was able to retrieve information from the mails that was sent to the user Mindy finding credentials to connect trough SSH, however the bash was restricted. Now that I found credentials for SSH I decided to use Jame Server RCE exploit in order to obtain an unrestricted shell when connecting trough SSH since the one I got trough connecting to the service was limited. Once inside the victim machine I found a cronjob that root was running where it was executing a script, when listing the script's permissions everyone was able to write on it so I decided to add a revershell to my kali machine obtaining one as the user root.
### NMAP
- Nmap scan 
	```python
	# Nmap 7.95 scan initiated Mon Apr 28 10:19:11 2025 as: /usr/lib/nmap/nmap --privileged -sCV -p22,25,80,110,119,4555 -oN targeted 10.10.10.51
	Nmap scan report for 10.10.10.51
	Host is up (0.28s latency).
	
	PORT     STATE SERVICE     VERSION
	22/tcp   open  ssh         OpenSSH 7.4p1 Debian 10+deb9u1 (protocol 2.0)
	| ssh-hostkey: 
	|   2048 77:00:84:f5:78:b9:c7:d3:54:cf:71:2e:0d:52:6d:8b (RSA)
	|   256 78:b8:3a:f6:60:19:06:91:f5:53:92:1d:3f:48:ed:53 (ECDSA)
	|_  256 e4:45:e9:ed:07:4d:73:69:43:5a:12:70:9d:c4:af:76 (ED25519)
	25/tcp   open  smtp        JAMES smtpd 2.3.2
	|_smtp-commands: solidstate Hello nmap.scanme.org (10.10.14.22 [10.10.14.22])
	80/tcp   open  http        Apache httpd 2.4.25 ((Debian))
	|_http-title: Home - Solid State Security
	|_http-server-header: Apache/2.4.25 (Debian)
	110/tcp  open  pop3        JAMES pop3d 2.3.2
	119/tcp  open  nntp        JAMES nntpd (posting ok)
	4555/tcp open  james-admin JAMES Remote Admin 2.3.2
	Service Info: Host: solidstate; OS: Linux; CPE: cpe:/o:linux:linux_kernel
	
	Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
	# Nmap done at Mon Apr 28 10:21:18 2025 -- 1 IP address (1 host up) scanned in 127.07 seconds
	```
### FOOTHOLD
- Our nmap scan reports a James Remote Admin version 2.3.2, which I decided to investigate finding a RCE exploit, however this exploit was only trigger trough a SSH connection
	![alt](/images/posts/solidstate2.webp)
- When inspecting the code I found the exploit was making a connection trough port 4555
	![alt](/images/posts/solidstate3.webp)
- So i decided to connect to port 4555 using telnet, once connected I was asking for credentials, so I use the script default credentials (root:root) being able to access 
	```
	username: root
	password: root
	```
	![alt](/images/posts/solidstate4.webp)
- Once inside I was able to list available users
	![alt](/images/posts/solidstate5.webp)
- I then found different users
	![alt](/images/posts/solidstate6.webp)
- However I also found the possibility to set a new password to a user so I decided to change mindy's password
	![alt](/images/posts/solidstate7.webp)
- I changed mindy's password successfully, I thought I was gonna be able to connect to SSH however when trying didint work so I decided to connect to POP3 (110) which is the mail service for linux with the credentials I obtained
	```
	telnet 10.10.10.51 110
	USER mindy
	PASS mindy123
	```
	![alt](/images/posts/solidstate8.webp)
- Once inside when listing mails I found 2 different ones but in one of them I found SSH credentials in clear text, however this access was restricted, probably a restricted bash
	```
	LIST
	RETR 2
	```
	![alt](/images/posts/solidstate9.webp)
- However since the Jame Server RCE exploit was trigger by a SSH connection I then decided to run it and then connect to SSH in order to trigger the command
	![alt](/images/posts/solidstate10.webp)
	![alt](/images/posts/solidstate11.webp)
### LOCAL
- Once inside the system as the user mindy I could read the user flag
	```
	${debian_chroot:+($debian_chroot)}mindy@solidstate:~$ whoami ; ip a ; cat /home/mindy/user.txt
	mindy
	1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1
	    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
	    inet 127.0.0.1/8 scope host lo
	       valid_lft forever preferred_lft forever
	    inet6 ::1/128 scope host 
	       valid_lft forever preferred_lft forever
	2: ens192: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
	    link/ether 00:50:56:94:7a:c3 brd ff:ff:ff:ff:ff:ff
	    inet 10.10.10.51/24 brd 10.10.10.255 scope global ens192
	       valid_lft forever preferred_lft forever
	    inet6 dead:beef::250:56ff:fe94:7ac3/64 scope global mngtmpaddr dynamic 
	       valid_lft 86400sec preferred_lft 14400sec
	    inet6 fe80::250:56ff:fe94:7ac3/64 scope link 
	       valid_lft forever preferred_lft forever
	9d49473d335517ea23db8685698ad128
	```
### PRIVILEGE ESCALATION
- When enumerating the system I found a script tmp.py which the owner was root and it had full permissions
	![alt](/images/posts/solidstate12.webp)
- Since I could write on the script to change its content I decided to ran pspy to see if there was a cronjob running a any user related to the script and indeed there was a cronjob running by root where it was executing the script
	![alt](/images/posts/solidstate13.webp)
- Knowing that root was executing the script and I had write privileges on it I decided to add a revershell instruction to it by using busybox nc
	![alt](/images/posts/solidstate14.webp)
- After a few minutes I obtained a shell as the user root
	![alt](/images/posts/solidstate.webp)
### ROOT
- I then retrieve root flag information
	```
	root@solidstate:~# whoami ; ip a ; cat /root/root.txt
	root
	1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1
	    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
	    inet 127.0.0.1/8 scope host lo
	       valid_lft forever preferred_lft forever
	    inet6 ::1/128 scope host 
	       valid_lft forever preferred_lft forever
	2: ens192: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
	    link/ether 00:50:56:94:7a:c3 brd ff:ff:ff:ff:ff:ff
	    inet 10.10.10.51/24 brd 10.10.10.255 scope global ens192
	       valid_lft forever preferred_lft forever
	    inet6 dead:beef::250:56ff:fe94:7ac3/64 scope global mngtmpaddr dynamic 
	       valid_lft 86399sec preferred_lft 14399sec
	    inet6 fe80::250:56ff:fe94:7ac3/64 scope link 
	       valid_lft forever preferred_lft forever
	5f1b334356701f3075f32a17f17d6342
	```

