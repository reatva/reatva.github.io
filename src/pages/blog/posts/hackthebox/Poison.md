---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: Poison HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/poison_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["linux", "machine", "offsec", "writeup", "vnc", "logpoisoning"]
languages: []
---

### SUMMARY
> This machine has 2 open ports (22 and 80), however port 80 takes a bit of time to lift. On port 80 we found a simple program that retrieves information of different files, when trying to obtain the /etc/passwd file we could see it, which means that we found a LFI. After trying to read especial files we couldnt find anything so I tried to read apache logs and I was able to, so I tried a Log Poisoning being able to add my malicious php payload to execute commands. After trying different stuffs I wasnt able to obtain a revershell but when listing the contents of the actual directory I found a pwdbackup.txt file that had charix's password encoded in base64. With charix password I connected trough SSH. Inside charix directory I found a secret.zip file that I was able to download to my kali machine using scp and when unzipping it I found what i looked like an encrypted password. I then found that root was running a vnc server on port 5901 so I did a local port forwarding in order to connect to vnc using vncviewer in my kali machine and passing the secret file as a password. When doing that I was able to obtain a shell as root

### NMAP
- Nmap scan finalized
	```
	# Nmap 7.95 scan initiated Mon Apr 28 13:40:53 2025 as: /usr/lib/nmap/nmap --privileged -sCV -p22,80 -oN targeted 10.10.10.84
	Nmap scan report for 10.10.10.84
	Host is up (0.39s latency).
	
	PORT   STATE SERVICE VERSION
	22/tcp open  ssh     OpenSSH 7.2 (FreeBSD 20161230; protocol 2.0)
	| ssh-hostkey: 
	|   2048 e3:3b:7d:3c:8f:4b:8c:f9:cd:7f:d2:3a:ce:2d:ff:bb (RSA)
	|   256 4c:e8:c6:02:bd:fc:83:ff:c9:80:01:54:7d:22:81:72 (ECDSA)
	|_  256 0b:8f:d5:71:85:90:13:85:61:8b:eb:34:13:5f:94:3b (ED25519)
	80/tcp open  http    Apache httpd 2.4.29 ((FreeBSD) PHP/5.6.32)
	|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
	|_http-server-header: Apache/2.4.29 (FreeBSD) PHP/5.6.32
	Service Info: OS: FreeBSD; CPE: cpe:/o:freebsd:freebsd
	
	Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
	# Nmap done at Mon Apr 28 13:41:17 2025 -- 1 IP address (1 host up) scanned in 23.29 seconds
	```
### FOOTHOLD
- On port 80 I found a program that let us retrieve different file extensions info
	![alt](/images/posts/poison.webp)
- I then decided to retrieve /etc/passwd file since it was showing information of internal files
	![alt](/images/posts/poison2.webp)
- I found a LFI vulnerability, after trying to retrieve information from differetn sensitive files I discovered I could read apache logs
	![alt](/images/posts/poison3.webp)
- I then decided to tried a log poisoning using burpsuite and modifying the http header
	![alt](/images/posts/poison4.webp)
- I came back to the webpage and tried to execute commands
	![alt](/images/posts/poison5.webp)
- Even though I was already executing commands in the victim machine nothing seemed to work. But when I listed files in the actual directory I found an interesting file
	![alt](/images/posts/poison6.webp)
- I read the file and found a base64 format 
	![alt](/images/posts/poison7.webp)
- After decoding the file I found charix password in clear text
	![alt](/images/posts/poison8.webp)
### LOCAL
- I then as able to connect to SSH and obtained user's flag
	```
	charix@Poison:~ % whoami; ifconfig ; cat /home/charix/user.txt
	charix
	le0: flags=8843<UP,BROADCAST,RUNNING,SIMPLEX,MULTICAST> metric 0 mtu 1500
		options=8<VLAN_MTU>
		ether 00:50:56:94:6f:03
		hwaddr 00:50:56:94:6f:03
		inet 10.10.10.84 netmask 0xffffff00 broadcast 10.10.10.255 
		nd6 options=29<PERFORMNUD,IFDISABLED,AUTO_LINKLOCAL>
		media: Ethernet autoselect
		status: active
	lo0: flags=8049<UP,LOOPBACK,RUNNING,MULTICAST> metric 0 mtu 16384
		options=600003<RXCSUM,TXCSUM,RXCSUM_IPV6,TXCSUM_IPV6>
		inet6 ::1 prefixlen 128 
		inet6 fe80::1%lo0 prefixlen 64 scopeid 0x2 
		inet 127.0.0.1 netmask 0xff000000 
		nd6 options=21<PERFORMNUD,AUTO_LINKLOCAL>
		groups: lo 
	eaacdfb2d141b72a589233063604209c
	```
### PRIVILEGE ESCALATION
- Enumerating the system I found that there was a secret.zip file in charix directory
	![alt](/images/posts/poison9.webp)
- I transfer the file and unzip it in my kali machine using charix ssh password
	```
	unzip secret.zip
	password: Charix!2#4%6&8(0
	```
	![alt](/images/posts/poison10.webp)
- I obtained what I seemed to be an encrypted password, since I couldnt do anything with it I left it in stand by and kept enumerating the system finding a process that root was running on port 5901 using VNC
	![alt](/images/posts/poison11.webp)
- When listing internal ports I found that indeed port 5901 was open
	![alt](/images/posts/poison12.webp)
- I then decided to do a Local Port Forwarding using SSH to make port 5901 accessible from my kali machine
	![alt](/images/posts/poison13.webp)
	![alt](/images/posts/poison14.webp)
- Since I had a password I decided to connect to my localhost on port 5901 using vncviewer and passing the secret file as password being able to connect successfully
	![alt](/images/posts/poison15.webp)
	![alt](/images/posts/poison16.webp)
### ROOT
- After being able to obtain a shell as root I send a revereshell and retrieve root's flag
	![alt](/images/posts/poison17.webp)