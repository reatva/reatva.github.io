---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: Pilgrimage HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/pilgrimage_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["hackthebox", "linux", "writeup", "provinggrounds"]
languages: []
---

### SUMMARY
> This machine has a http service running on port 80, nmap scan shows us that there is a .git directory, using git-dumper we were able to retrieve .git directory files and found that the webpage is running **image magick** in order to resize the images we can upload, however the version that the webservice is running is vulnerable to LFI, we found a resource on github that explained us how to abuse from it and we were able to retrieve information from the victim machine. We also found different php files within the github directory where we found a route to the database, we then pass the route to the script in order to retrieve infromation trough the LFI and in cyberchef we decode the ouput obtaining emily's password in clear text. Inside the victima machine we ran pspy and found that root was running a script that was using **binwalk 2.3.2** that was vulnerable to LPE. We found a script and by passing a image it generates a malicious png that when we put into the victim machine in the route it was specified in the script we were able to obtain a revershell as the user root. 

#Lecciones: Siempre analizar el output inicial de pspy, además al inspeccionar scripts si se esta haciendo uso de un binario desconocido buscar la version y ver si es que es vulnerable a RCE
### NMAP
- Nmap scan report
	```
	# Nmap 7.95 scan initiated Tue Apr 29 11:08:21 2025 as: /usr/lib/nmap/nmap --privileged -sCV -p22,80 -oN targeted 10.10.11.219
	Nmap scan report for pilgrimage.htb (10.10.11.219)
	Host is up (0.27s latency).
	
	PORT   STATE SERVICE VERSION
	22/tcp open  ssh     OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0)
	| ssh-hostkey: 
	|   3072 20:be:60:d2:95:f6:28:c1:b7:e9:e8:17:06:f1:68:f3 (RSA)
	|   256 0e:b6:a6:a8:c9:9b:41:73:74:6e:70:18:0d:5f:e0:af (ECDSA)
	|_  256 d1:4e:29:3c:70:86:69:b4:d7:2c:c8:0b:48:6e:98:04 (ED25519)
	80/tcp open  http    nginx 1.18.0
	| http-cookie-flags: 
	|   /: 
	|     PHPSESSID: 
	|_      httponly flag not set
	|_http-title: Pilgrimage - Shrink Your Images
	|_http-server-header: nginx/1.18.0
	| http-git: 
	|   10.10.11.219:80/.git/
	|     Git repository found!
	|     Repository description: Unnamed repository; edit this file 'description' to name the...
	|_    Last commit message: Pilgrimage image shrinking service initial commit. # Please ...
	Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
	
	Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
	# Nmap done at Tue Apr 29 11:08:37 2025 -- 1 IP address (1 host up) scanned in 16.40 seconds
	```
### FOOTHOLD
- We dumped git directory into our kali machine obtaining a directory with all the files from the project
	```
	git-dumper http://10.10.11.219/.git/ dump
	```
	![alt](/images/posts/pilgrimage.webp)
- When running the magick script to show its version we found it was a imagemagick binary
	![alt](/images/posts/pilgrimage2.webp)
- I then found a resourced that abuse of that specific version, because it allows to read local files
	![alt](/images/posts/pilgrimage3.webp)
- The exploit showed us how we can pass a file to read and it will create a malicious png file for us that when resized (the web does it for us) we can then use that new image and retrieve its content in hex and decoded to read it [READ MORE](https://github.com/entr0pie/CVE-2022-44268)
	![alt](/images/posts/pilgrimage4.webp)
- We visit the webservice and upload our malicious image, when uploaded it give us an url to download
	![alt](/images/posts/pilgrimage5.webp)
- We download the image trough the url with wget in our kali machine and follow the steps from github
	![alt](/images/posts/pilgrimage6.webp)
	![alt](/images/posts/pilgrimage7.webp)
	![alt](/images/posts/pilgrimage8.webp)
- With the HEX content I then use CyberChef and it worked! I was able to read local files
	![alt](/images/posts/pilgrimage9.webp)
- Inspecting the different php files within the git directory I found a route of a database
	![alt](/images/posts/pilgrimage10.webp)
- I then did the same steps as before but passing to the script the new route I found and I was able to retrieve information
	![alt](/images/posts/pilgrimage11.webp)
- Even though there was a lot of empy info I was able to find emily's password in clear text
	```
		username: emily
		password abigchonkyboi123
	```
	![alt](/images/posts/pilgrimage12.webp)
### LOCAL
- I then was able to connect to SSH using the password I found and read the user flag
	```
	emily@pilgrimage:~$ whoami ; ifconfig ; cat /home/emily/user.txt
	emily
	eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
	        inet 10.10.11.219  netmask 255.255.254.0  broadcast 10.10.11.255
	        ether 00:50:56:94:31:c4  txqueuelen 1000  (Ethernet)
	        RX packets 353069  bytes 51243845 (48.8 MiB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 295294  bytes 124788734 (119.0 MiB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
	        inet 127.0.0.1  netmask 255.0.0.0
	        loop  txqueuelen 1000  (Local Loopback)
	        RX packets 0  bytes 0 (0.0 B)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 0  bytes 0 (0.0 B)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	312281ab237af6a192741b94fc5f53e1
	```
### PRIVILEGE ESCALATION
- Once inside the machine I couldnt find anything interesting so I decided to run pspy64 and found that root was running a script 
	![alt](/images/posts/pilgrimage13.webp)
- Reading the script I found that it was using binwalk binary
	![alt](/images/posts/pilgrimage14.webp)
- I then retrieve binwalk version 
	![alt](/images/posts/pilgrimage15.webp)
- I found this version was vulnerable and allow the user to obtain a revershell
	![alt](/images/posts/pilgrimage16.webp)
- The script needed a image an an ip and port to pass and when running the script it creates a malicious png image
	![alt](/images/posts/pilgrimage17.webp)
- I then downloaded the image in the route the script was reading which is /var/www/pilgrimage.htb/shrunk started a netcat listener and obtained a revershell
	![alt](/images/posts/pilgrimage18.webp)
### ROOT
- I then was able to read root flag
	```
	root@pilgrimage:~/quarantine# whoami ; ifconfig ; cat /root/root.txt
	root
	eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
	        inet 10.10.11.219  netmask 255.255.254.0  broadcast 10.10.11.255
	        ether 00:50:56:94:31:c4  txqueuelen 1000  (Ethernet)
	        RX packets 353631  bytes 51292603 (48.9 MiB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 295861  bytes 124844911 (119.0 MiB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
	        inet 127.0.0.1  netmask 255.0.0.0
	        loop  txqueuelen 1000  (Local Loopback)
	        RX packets 0  bytes 0 (0.0 B)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 0  bytes 0 (0.0 B)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	cb07e452305a3d3837d0182eb5cad608
	```

