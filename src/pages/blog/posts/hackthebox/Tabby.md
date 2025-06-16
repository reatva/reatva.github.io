---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: Tabby HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/tabby_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["linux", "machine", "oscp", "apache", "tomcat", "lxd", "group"]
languages: []
---


### SUMMARY
> This machine has a 3 open ports, but the most important are the HTTP services running in port 80 and 8080, when accessing to port 80 we found a subdomin and in this subdomain we found a LFI. Accessing port 8080 we found that Apache Tomcat is running, so with the LFI we retrieve the information from the apache-tomcatuser.xml and we were able to access to the host manager panel of apache tomcat in port 8080. Here we upload a war file using curl and gain access to the system. Inside the system we found a zip file that we trasnfer to our kali machine and when cracking the hash to access to the files we obtain the password however we dont get anything interesting from the zip file but when trying to change users and putting the password we obtain from cracking the hash we change user and become ash. As ash we were able to exploit the lxd group obtaining access as the user root to a container and adding the user ash to the sduoers privileges commands.

#Lecciones : Cuando no encontremos el path de credenciales de algun programa en linux crearnos un contenedor e instalar el programa para tener acceso a las distintas rutas
#Lecciones: El script para escalar privilegios no funcionaba porque primero debiamos hacer un init de lxc 
### NMAP
- Nmap scan report
	```
	# Nmap 7.95 scan initiated Mon May 12 10:39:03 2025 as: /usr/lib/nmap/nmap --privileged -sCV -p22,80,8080 -oN targeted 10.10.10.194
	Nmap scan report for 10.10.10.194
	Host is up (0.28s latency).
	
	PORT     STATE SERVICE VERSION
	22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4 (Ubuntu Linux; protocol 2.0)
	| ssh-hostkey: 
	|   3072 45:3c:34:14:35:56:23:95:d6:83:4e:26:de:c6:5b:d9 (RSA)
	|   256 89:79:3a:9c:88:b0:5c:ce:4b:79:b1:02:23:4b:44:a6 (ECDSA)
	|_  256 1e:e7:b9:55:dd:25:8f:72:56:e8:8e:65:d5:19:b0:8d (ED25519)
	80/tcp   open  http    Apache httpd 2.4.41 ((Ubuntu))
	|_http-title: Mega Hosting
	|_http-server-header: Apache/2.4.41 (Ubuntu)
	8080/tcp open  http    Apache Tomcat
	|_http-title: Apache Tomcat
	Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
	
	Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
	# Nmap done at Mon May 12 10:39:27 2025 -- 1 IP address (1 host up) scanned in 24.38 seconds
	```
### FOOTHOLD
- On port 80 we found something interesting when hovering over the links
	![alt](/images/posts/tabby.webp)
- Whe found what it looked like a LFI, so when trying to read the contents from the /etc/passwd I wass able to!
	![alt](/images/posts/tabby2.webp)
- Trying to read the id_rsa from the user ash I couldnt so I had a look at the port 8080 that was another HTTP service and found that there was an apache tomcat running in that port
	![alt](/images/posts/tabby3.webp)
- When trying to access to the links "manager webapp" and "host-manager webapp" we were asked for credentials and when using the LFI to read the tocat-users.xml file we didint find anything
	![alt](/images/posts/tabby4.webp)
- However we found another route where the tomcat-users.xml file could be and when reading the content with the LFI we found credentials!
	![alt](/images/posts/tabby5.webp)
- With the credentials we access to the host-manager webapp finding this panel
	![alt](/images/posts/tabby6.webp)
- Since there wasnt the normal panel to upload our war files we uploaded our war file using another way. We first create our msfvenom 
	![alt](/images/posts/tabby7.webp)
- I then used curl to uplaod the malicious war file using the follwoing route and once was uplaoded I used curl again to trigger the reversehll
	![alt](/images/posts/tabby8.webp)
- I then obtian a shell as the user tomcat
	![alt](/images/posts/tabby9.webp)
### USER PIVOTING
- As the user tomcat we enumerate the system finding a interesting file in the /var/www/html directory
	![alt](/images/posts/tabby10.webp)
- I trasnfered the backup file to my kali machine but it was protected with password so I used zip2john to obtain the hash and cracked and when doing that I found a password
	![alt](/images/posts/tabby11.webp)
- I then extrected the files from the backup however dindint find anything interesting so i decided to use the password as the password for the user ash and I was able to connect to the victim machine as ash
	![alt](/images/posts/tabby12.webp)	
### LOCAL
- I was able to read the user flag
	```
	ash@tabby:/var/www/html/files$ whoami && ifconfig && cat /home/ash/user.txt
	ash
	ens160: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
	        inet 10.10.10.194  netmask 255.255.255.0  broadcast 10.10.10.255
	        ether 00:50:56:94:06:43  txqueuelen 1000  (Ethernet)
	        RX packets 441803  bytes 69065736 (69.0 MB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 436216  bytes 475281771 (475.2 MB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
	        inet 127.0.0.1  netmask 255.0.0.0
	        loop  txqueuelen 1000  (Local Loopback)
	        RX packets 15767  bytes 1218317 (1.2 MB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 15767  bytes 1218317 (1.2 MB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	lxdbr0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
	        inet 10.165.52.1  netmask 255.255.255.0  broadcast 0.0.0.0
	        inet6 fe80::216:3eff:fe96:99ed  prefixlen 64  scopeid 0x20<link>
	        inet6 fd42:799d:5e42:f7d1::1  prefixlen 64  scopeid 0x0<global>
	        ether 00:16:3e:96:99:ed  txqueuelen 1000  (Ethernet)
	        RX packets 16  bytes 1564 (1.5 KB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 25  bytes 3628 (3.6 KB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	vethdbdfdd4e: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
	        ether da:3b:b0:8d:4c:4c  txqueuelen 1000  (Ethernet)
	        RX packets 16  bytes 1788 (1.7 KB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 25  bytes 3628 (3.6 KB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	37c65e3d9778876d887cc4dfae46a9d8
	```
### PRIVILEGE ESCALATION
- Enumerating the system with the user ash I found he was inside the LXD group
	![alt](/images/posts/tabby13.webp)
- I then found a way to escalte privilege trough the lxd group in github [READ HERE](https://www.hackingarticles.in/lxd-privilege-escalation/). When trying to use the exploit it wasnt working it only upload the image, however. After doing a "lxd init" and fololowing the steps I was able to then use "lxc init myimage ignite" and create the volume
	![alt](/images/posts/tabby14.webp)
- I then give bash SUID permissions
	![alt](/images/posts/tabby15.webp)
	![alt](/images/posts/tabby16.webp)
### ROOT
- I then read the root flag
	```
	bash-5.0# whoami && ifconfig && cat /root/root.txt
	root
	ens160: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
	        inet 10.10.10.194  netmask 255.255.255.0  broadcast 10.10.10.255
	        ether 00:50:56:94:06:43  txqueuelen 1000  (Ethernet)
	        RX packets 442068  bytes 69083462 (69.0 MB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 436618  bytes 475315103 (475.3 MB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
	        inet 127.0.0.1  netmask 255.0.0.0
	        loop  txqueuelen 1000  (Local Loopback)
	        RX packets 16106  bytes 1244206 (1.2 MB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 16106  bytes 1244206 (1.2 MB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	lxdbr0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
	        inet 10.165.52.1  netmask 255.255.255.0  broadcast 0.0.0.0
	        inet6 fe80::216:3eff:fe96:99ed  prefixlen 64  scopeid 0x20<link>
	        inet6 fd42:799d:5e42:f7d1::1  prefixlen 64  scopeid 0x0<global>
	        ether 00:16:3e:96:99:ed  txqueuelen 1000  (Ethernet)
	        RX packets 19  bytes 1948 (1.9 KB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 29  bytes 4201 (4.2 KB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	vethdbdfdd4e: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
	        ether da:3b:b0:8d:4c:4c  txqueuelen 1000  (Ethernet)
	        RX packets 19  bytes 2214 (2.2 KB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 29  bytes 4201 (4.2 KB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	279cac6ac4efc8f4daef35d64f6ccd3c
	```
