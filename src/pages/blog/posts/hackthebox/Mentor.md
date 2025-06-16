---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: Mentor HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/mentor_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["linux", "machine", "snmp", "api", "abuse", "UDP", "postgres"]
languages: []
---

### SUMMARY
This machine has port 80 open with an API. Using nmap, we found UDP port 161 open. With snmpbrute.py, we brute-forced the SNMP community string "internal" for v2c.

Using it with snmpwalk, we found plaintext credentials. Testing these on the API as user "james," we got a token to execute commands.

We found a vulnerable backup endpoint allowing command execution, sent a reverse shell, and accessed a container. There, we found PostgreSQL credentials for another container. Using chisel, we forwarded port 5432, got the "svc" user hash, cracked it, and SSHed into the real machine.

On the real machine, we found plaintext creds for "james" in /etc/snmp/snmpd.conf. Logged in as james, we could escalate to root by spawning shells as any user.

### FOOTHOLD
- We found an HTTP service running on port 80 that redirects us to mentorquotes.htb.
	![alt](/images/posts/mentor.webp)
- When enumerating subdomains, we found an API.
	![alt](/images/posts/mentor2.webp)
- While enumerating the different directories of the API, we found a "docs" directory.
	![alt](/images/posts/mentor3.webp)
- Accessing the "docs" directory, we found that we can read the API documentation.
	![alt](/images/posts/mentor4.webp)
- We need to be an admin to perform certain actions, but we don’t have any user accounts. However, we found that “james” is a valid user. Finding nothing else, we decided to scan UDP ports and discovered port 161 open.
	![alt](/images/posts/mentor5.webp)
- When enumerating with SNMP, we found nothing since it only scanned version 1. So, we used snmpbrute.py to brute-force community strings for various SNMP versions and discovered one called "internal."
	![alt](/images/posts/mentor6.webp)
- Using snmpwalk with the new community string we found, we listed the running processes on the system and managed to see what appears to be a password in plain text.
	```
		snmbbulkwalk -v2c -c internal 10.10.11.193 HOST-RESOURCES-MIB::hrSWRunParameters
	```
	![alt](/images/posts/mentor7.webp)
- With this password, we tried to authenticate to the API as the user **james** to check if the password is valid.
	![alt](/images/posts/mentor8.webp)
- The credentials are valid, so we obtained a token. Remembering our earlier ffuf directory enumeration on **api.mentorquotes.htb**, we found an **admin** directory, so we sent a request to it using the token in the **Authorization** header.
	![alt](/images/posts/mentor9.webp)
- We found two routes. When accessing the **backup** route, it returns a body error.
	![alt](/images/posts/mentor10.webp)
- By changing the content type to **application/json** and sending an empty JSON body (`{}`), it returns a **path error**.
	![alt](/images/posts/mentor11.webp)
- We set it as a parameter and get a valid response.
	![alt](/images/posts/mentor12.webp)
- When trying a command injection, we managed to send a ping to our attacking machine! It’s important to note that the injection worked by wrapping the command with `;`, so always try this since there might be other parameters being executed in the statement.
	![alt](/images/posts/mentor13.webp)
	![alt](/images/posts/mentor14.webp)
- We send a reverse shell to our Kali machine
	![alt](/images/posts/mentor15.webp)
	![alt](/images/posts/mentor16.webp)
- While enumerating the system, we found configuration files containing credentials for the Postgres database.
	![alt](/images/posts/mentor18.webp)
- Listing the open ports in the container, we found a connection to 172.22.0.1 on port 5432 (Postgres).
	![alt](/images/posts/mentor19.webp)
- Since we’re in the same network range, we can connect to that host — so we upload **chisel** to the victim machine, run it, and forward port 5432 from 172.22.0.1 to our attacking machine.
	![alt](/images/posts/mentor20.webp)
- We access **Postgres** using the credentials we found, connecting from our foothold inside the victim machine.
	![alt](/images/posts/mentor21.webp)
- Listing the databases, we find **mentorquotes\_db**. Inside it, there is a **users** table containing credentials hashed with MD5.
	![alt](/images/posts/mentor22.webp)
- After cracking the hashes, we obtain the password for the user **svc**.
	![alt](/images/posts/mentor23.webp)
- We successfully connect via SSH.
	![alt](/images/posts/mentor17.webp)
### LOCAL
	```
	svc@mentor:~$ whoami && ifconfig && cat /home/svc/user.txt
	svc
	docker0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
	        inet 172.17.0.1  netmask 255.255.0.0  broadcast 172.17.255.255
	        ether 02:42:bb:14:eb:64  txqueuelen 0  (Ethernet)
	        RX packets 0  bytes 0 (0.0 B)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 0  bytes 0 (0.0 B)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
	        inet 10.10.11.193  netmask 255.255.254.0  broadcast 10.10.11.255
	        inet6 dead:beef::250:56ff:fe94:9e33  prefixlen 64  scopeid 0x0<global>
	        inet6 fe80::250:56ff:fe94:9e33  prefixlen 64  scopeid 0x20<link>
	        ether 00:50:56:94:9e:33  txqueuelen 1000  (Ethernet)
	        RX packets 40728  bytes 8806147 (8.8 MB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 34551  bytes 10638739 (10.6 MB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
	        inet 127.0.0.1  netmask 255.0.0.0
	        inet6 ::1  prefixlen 128  scopeid 0x10<host>
	        loop  txqueuelen 1000  (Local Loopback)
	        RX packets 3680  bytes 261086 (261.0 KB)
	        RX errors 0  dropped 0  overruns 0  frame 0
	        TX packets 3680  bytes 261086 (261.0 KB)
	        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
	
	251a2384e4284b7fc5bd4d8e783ad7f6
	```
### PRIVILEGE ESCALATION
- Enumerating the system, we find valid credentials in the directory /etc/snmp/snmpd.conf.
	![alt](/images/posts/mentor24.webp)
- By switching users, we manage to get a shell as james and find that he can execute a shell as any user.
	![alt](/images/posts/mentor25.webp)
- We became root
	![alt](/images/posts/mentor26.webp)
### ROOT
	```
	# whoami && cat /root/root.txt
	root
	59223d73f20ad3a42fd866ba65def8b9
	```