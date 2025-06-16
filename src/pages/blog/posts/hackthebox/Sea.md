---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: Sea HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/sea_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["linux", "machine", "writeup", "hackthebox", "wondercms", "xss", "cms"]
languages: []
---
----
### SUMMARY
>This machine had only 2 ports open, when investigating port 80 I found a contact form that was making a request to the url that you introduce, however no XSS attack was working, I the fuzz for directories and found themes, inside themes I found one called bike and I was able to read the version file, when searching for the version of the theme I found it was related to wondercms and it was vulnerable to XSS trough bike theme version 3.2.0 and that could lead to RCE via stealing a token from the administrator and uplaoding a malicios plugin which was only our payload inside a directory and zipped. I found a exploit and modified it an I was able to exevute commands on the victim machine. Once inside the system as the user www-data I found a database file with a hash that I was able to crack later on and use it to connect trough SSH as the user amay, after that I found another http service running internally on port 8080 and use chisel to make that port accessible from my kali machine. Inside this service I found that I could read privilege files like the access.log and auth.,log so I interceprted the request with burpsuite and by adding ";" and putting another command I was able to execute commands as root so I changed the bash to be SUID and become root 
### NMAP
- Nmap scan results
	```
	# Nmap 7.95 scan initiated Wed Apr 30 11:07:29 2025 as: /usr/lib/nmap/nmap --privileged -sCV -p22,80 -oN targeted 10.10.11.28
	Nmap scan report for 10.10.11.28
	Host is up (0.28s latency).
	
	PORT   STATE SERVICE VERSION
	22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.11 (Ubuntu Linux; protocol 2.0)
	| ssh-hostkey: 
	|   3072 e3:54:e0:72:20:3c:01:42:93:d1:66:9d:90:0c:ab:e8 (RSA)
	|   256 f3:24:4b:08:aa:51:9d:56:15:3d:67:56:74:7c:20:38 (ECDSA)
	|_  256 30:b1:05:c6:41:50:ff:22:a3:7f:41:06:0e:67:fd:50 (ED25519)
	80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
	|_http-title: Sea - Home
	| http-cookie-flags: 
	|   /: 
	|     PHPSESSID: 
	|_      httponly flag not set
	|_http-server-header: Apache/2.4.41 (Ubuntu)
	Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
	
	Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
	# Nmap done at Wed Apr 30 11:07:53 2025 -- 1 IP address (1 host up) scanned in 24.32 seconds
	```
### FOOTHOLD
- We found a webpage running on port 80, when doing a quick enumeration of it we found a form panel where we can introduce our url
	![alt](/images/posts/sea.webp)
- When sending data and out url in the website field we recieved a GET request, this could've meant that an xss attack would be our foothoold however when sending different payloads our XSS wasn't working
	![alt](/images/posts/sea2.webp)
- Since XSS wasn't working I decided to enumerate directories finding themes
	![alt](/images/posts/sea3.webp)
- I decided to keep digging into themes directory and found another interesting one
	![alt](/images/posts/sea4.webp)
- Once again I inspected bike directory and found a version
	![alt](/images/posts/sea5.webp)
- I then searched for the directory on the webpage and indeed it showed me the version of the theme bike
	![alt](/images/posts/sea6.webp)
- When researching about bike version I found that it was part of wondercms and there was an XSS to RCE that can be exploited in that version 
	![alt](/images/posts/sea7.webp)
- I then used searchsploit to find exploits related to wondershare
	![alt](/images/posts/sea8.webp)
- There was a really interesting one "XSS to RCE", I downloaded and inspected the code, finding that it was looking for the loginURL directory and it was replacing it with a malicious XSS payload
	![alt](/images/posts/sea9.webp)
- Testing the loginURL in the webapge worked! 
	![alt](/images/posts/sea10.webp)
- So I then decided to try to put craft the malicios payload on the web
	![alt](/images/posts/sea11.webp)
- It seems that the loginURL is vulnerable to XSS applying a bypass, and when reading more of the script we downloaded I found that its trying to obtain a token and then install a plugin with it 
	![alt](/images/posts/sea12.webp)
- Since its downloading  a zip file from github and hackthebox machines dont have access to internet I downloaded the zip file in my kali machine and created my own revershell that was a simple  php request to get something from a GET parameter
	![alt](/images/posts/sea13.webp)
- Knowing this I decided to run the script as it was and It created a xss.js file
	![alt](/images/posts/sea14.webp)
- This xss.js file was the commented section on the main script
	![alt](/images/posts/sea15.webp)
- Since the website filed in the contact.php directory of the webpage make us a request we then send the payload that attempt against loginURL as the website field, this will then steal administrator token and trough the XSS bypass GET a resource that we're hosting which is the xss.js file, taht in this case contains a instruction to get the zip file and install it in the plugins directory
- Using the main script xss.js example I crafted my own that was obtaining the token, installing the plugin and sending the request
	![alt](/images/posts/sea16.webp)
- Then I use the malicious loginURL payload to introduce it on the website field in the contact.php directory
	![alt](/images/posts/sea17.webp)
- I hosted a webserver by using python and waited for the requests
	![alt](/images/posts/sea18.webp)
- I then decided to look for the plugin into the themes directory as the script we found indicated
	![alt](/images/posts/sea19.webp)
	![alt](/images/posts/sea20.webp)
- With no errors seems that our plugin was uploaded successfully, now we tried to execute commands being able to
	![alt](/images/posts/sea21.webp)	
- I then send a revershell to my kali machine connecting as the user ww-data and when enumerating sea directory I found a database file with a hashed password
	![alt](/images/posts/sea22.webp)
- In this case the hash had escaped the slahes so we had to unaescaped them in otder to be a valid hash. Using hashcat I was able to obtain the password in clear text
	![alt](/images/posts/sea23.webp)
- Investigating users inside the system I found user amay had the user.txt in her directory so I decided to use the password I cracked to connect as that user trough ssh
	![alt](/images/posts/sea24.webp)
	![alt](/images/posts/sea25.webp)
### LOCAL
- As the user amay I was able to read user's flag
	```
	amay@sea:~$ whoami ; ifconfig; cat /home/amay/user.txt
	amay
	eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
	        inet 10.10.11.28  netmask 255.255.254.0  broadcast 10.10.11.255
	        ether 00:50:56:94:ba:78  txqueuelen 1000  (Ethernet)
	        RX packets 1007823  bytes 109947308 (109.9 MB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 906923  bytes 820930902 (820.9 MB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
	        inet 127.0.0.1  netmask 255.0.0.0
	        loop  txqueuelen 1000  (Local Loopback)
	        RX packets 94427  bytes 9878966 (9.8 MB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 94427  bytes 9878966 (9.8 MB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	0700ad14e8df2756ca2a45e39e5a16b1
	```
### PRIVILEGE ESCALATION
- As the user amay I found there was a 8080 port internally open
	![alt](/images/posts/sea26.webp)
- I then use chisel to make port 8080 accesible from my kali machine
	![alt](/images/posts/sea27.webp)
- This was interesting, I was able to read access.log and auth.log files which are files that only root can read
	![alt](/images/posts/sea28.webp)
- I then used burpsuite to intercept the request using burpsuite built-in web browser (foxyproxy wasnt intercepting localhost requests). And since I was able to read privileges files root could've been executing commands, so I decided to change the request and send a ping to my kali machine to see if I was able to execute commands
	![alt](/images/posts/sea29.webp)
	![alt](/images/posts/sea30.webp)
- By just adding a ";" and another command in the request I was able to execute commands, I then decided to convert the bash into SUID to spawn a privilege basha as any user
	![alt](/images/posts/sea31.webp)
- Checking the bash privileges I was able to changed it to SUID
	![alt](/images/posts/sea32.webp)
### ROOT
- I then spawn a shell as thge user root and was able to read root flag
	```
	bash-5.0# whoami; ifconfig; cat /root/root.txt
	root
	eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
	        inet 10.10.11.28  netmask 255.255.254.0  broadcast 10.10.11.255
	        ether 00:50:56:94:ba:78  txqueuelen 1000  (Ethernet)
	        RX packets 1008259  bytes 109987778 (109.9 MB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 907398  bytes 821017270 (821.0 MB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
	        inet 127.0.0.1  netmask 255.0.0.0
	        loop  txqueuelen 1000  (Local Loopback)
	        RX packets 96937  bytes 10127068 (10.1 MB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 96937  bytes 10127068 (10.1 MB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	070603f3b2c4d6b17d5aa887e25d04ad
	```

