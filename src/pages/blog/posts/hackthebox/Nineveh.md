---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: Nineveh HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/nineveh_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["linux", "LFI", "phpliteadmin", "portknocking", "chkrootkit", "hydra"]
languages: []
---

### SUMMARY
>This machine has only two open ports. On port 80, we found a login panel and used Hydra to crack the admin password. After logging in, we discovered an LFI vulnerability but couldn’t exploit it directly. The admin left notes asking us to fix the database. On port 443, a `db` directory hosts phpLiteAdmin, which also required a password we cracked with Hydra. Using searchsploit, we found an exploit that involved creating a `.php` database and inserting a malicious TXT payload in the "default value" field. The exploit revealed the directory where it was saved, and we used the LFI to execute commands on the victim machine. We sent a reverse shell, and once inside, `linpeas` showed a port knocking script requiring knocks on three consecutive ports within 5 seconds to open SSH. Without an SSH key, we extracted the `id_rsa` of user `amrois` by running `strings` on an image found in the `secure_notes` directory on port 443. After performing the port knocking with `nmap`, we accessed the machine via SSH. Using `pspy`, we found root runs a task executing `chkrootkit`, which we can exploit by placing a malicious file named `update` in `/tmp`, allowing us to run code as root and gain full system access.

### PORT 80
- We found an HTTP service running on port 80 with nothing interesting.
	![alt](/images/posts/nineveh2.webp)
- Enumerating with ffuf, we found a directory named "department."
	![alt](/images/posts/nineveh3.webp)
- Accessing from the web, we found a login panel to which we have no access.
	![alt](/images/posts/nineveh4.webp)
- We discovered that the user "admin" is valid by testing and seeing from the error that the password was invalid.
	![alt](/images/posts/nineveh5.webp) ![alt](/images/posts/nineveh6.webp)
- We used Hydra to brute-force the password and successfully found it!
	```c
	hydra -l admin -P <DICCIONARIO> <IP> http-post-form "<PATH>:<FIELD1>=<KEY>&<PASS_FIELD>=^PASS^:<ERROR>"
	```
	![alt](/images/posts/nineveh7.webp)
- We accessed the admin panel and found various notes.
	![alt](/images/posts/nineveh8.webp)
- But as we can see in the URL, it seems possible to perform an LFI. The trick was to remove the `.txt` and add path traversals with the file to list, as shown in the image.
	![alt](/images/posts/nineveh9.webp)
- We managed to perform an LFI and read internal files of the victim machine; however, when trying to read the `id_rsa` of user amrois, we found nothing, so we moved on to enumerate port 443.
### PORT 443
- We accessed port 443 using the subdomain; on the main page, we found nothing of importance.
	![alt](/images/posts/nineveh10.webp)
- Enumerating with ffuf, we found that there is a directory named "db."
	![alt](/images/posts/nineveh11.webp)
- Accessing from the web, we found a login panel for phpLiteAdmin, which asks us for a password.
	![alt](/images/posts/nineveh12.webp)
- Not having any passwords, we used Hydra again to brute-force and found the password.
	```c
	hydra 10.10.14.43 -l admin -P /usr/share/SecLists/Passwords/twitter-banned.txt https-post-form "/db/index.php:password=^PASS^&remember=yes&login=Log+In&proc_login=true:Incorrect password"
	```
	![alt](/images/posts/nineveh13.webp)
- We found the password and successfully accessed the admin panel.
	![alt](/images/posts/nineveh14.webp)
- Here we found an exploit with searchsploit that explains how to abuse phpLiteAdmin by creating a database named "php" and placing a PHP statement in the default value. It’s important that our PHP instruction is enclosed in double quotes, as it didn’t work with single quotes.
	![alt](/images/posts/nineveh15.webp)**-->** ![alt](/images/posts/nineveh16.webp)**-->**![alt](/images/posts/nineveh17.webp)
### COMMAND EXECUTION
- Our database was saved in the directory `/var/tmp/tester.php`, and since we have an LFI, we tried to access it and successfully executed commands.
	![alt](/images/posts/nineveh18.webp)
	![alt](/images/posts/nineveh19.webp)
- Now we send ourselves a reverse shell using busybox, gaining access as the user www-data.
	![alt](/images/posts/nineveh.webp)
### ENUMERATION
- Enumerating the system, we found only one image in the `secure_notes` directory, so we tried listing its content with `strings` and discovered the `id_rsa` of the user amrois.
	![alt](/images/posts/nineveh20.webp)
### PORT KNOCKING
- With LinPEAS, we found that there is a port knocking daemon running.
	![alt](/images/posts/nineveh21.webp)
- Inspecting the port knocking configuration file located at `/etc/knockd.conf`, it specifies that to open SSH we must knock on 3 ports consecutively within 5 seconds.
	![alt](/images/posts/nineveh22.webp)
- Using nmap, we successfully performed port knocking and connected to the victim machine with the id\_rsa key of the user amrois.
	```c
	for i in <PORTS>; do nmap -Pn --host-timeout 100 --max-retries 0 -p $i 10.10.10.43 >/dev/null; done; ssh -i id_rsa amrois@10.10.10.43
	```
	![alt](/images/posts/nineveh23.webp)
### LOCAL
	```
	amrois@nineveh:/tmp$ whoami && ifconfig && cat /home/amrois/user.txt
	amrois
	ens160    Link encap:Ethernet  HWaddr 00:50:56:94:bd:45  
	          inet addr:10.10.10.43  Bcast:10.10.10.255  Mask:255.255.255.0
	          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
	          RX packets:1786849 errors:0 dropped:0 overruns:0 frame:0
	          TX packets:1004079 errors:0 dropped:0 overruns:0 carrier:0
	          collisions:0 txqueuelen:1000 
	          RX bytes:290358539 (290.3 MB)  TX bytes:519866729 (519.8 MB)
	
	lo        Link encap:Local Loopback  
	          inet addr:127.0.0.1  Mask:255.0.0.0
	          UP LOOPBACK RUNNING  MTU:65536  Metric:1
	          RX packets:10530 errors:0 dropped:0 overruns:0 frame:0
	          TX packets:10530 errors:0 dropped:0 overruns:0 carrier:0
	          collisions:0 txqueuelen:1 
	          RX bytes:844675 (844.6 KB)  TX bytes:844675 (844.6 KB)
	
	2797254c669cd2188308b5b9a1c07f27
	```
### CHKROOTKIT
- We gained access as the user amrois, and while enumerating cron jobs with pspy, we discovered that the root user is running chkrootkit.
	![alt](/images/posts/nineveh25.webp)
- We found an exploit with searchsploit.
	![alt](/images/posts/nineveh24.webp)
- Reading what the exploit does, it tells us to create a file named **update** in the **/tmp** directory, and if it contains malicious instructions, root will execute it—and that’s exactly what we do.
	![alt](/images/posts/nineveh26.webp)
	![alt](/images/posts/nineveh27.webp)
- After a few minutes, we list the bash and see that it has the SUID bit set.
	![alt](/images/posts/nineveh28.webp)
- We became root
	![alt](/images/posts/nineveh29.webp)
### ROOT
	```
		bash-4.3# whoami && ifconfig && cat /root/root.txt
	root
	ens160    Link encap:Ethernet  HWaddr 00:50:56:94:bd:45  
	          inet addr:10.10.10.43  Bcast:10.10.10.255  Mask:255.255.255.0
	          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
	          RX packets:1786737 errors:0 dropped:0 overruns:0 frame:0
	          TX packets:1004012 errors:0 dropped:0 overruns:0 carrier:0
	          collisions:0 txqueuelen:1000 
	          RX bytes:290348593 (290.3 MB)  TX bytes:519858239 (519.8 MB)
	
	lo        Link encap:Local Loopback  
	          inet addr:127.0.0.1  Mask:255.0.0.0
	          UP LOOPBACK RUNNING  MTU:65536  Metric:1
	          RX packets:10530 errors:0 dropped:0 overruns:0 frame:0
	          TX packets:10530 errors:0 dropped:0 overruns:0 carrier:0
	          collisions:0 txqueuelen:1 
	          RX bytes:844675 (844.6 KB)  TX bytes:844675 (844.6 KB)
	
	bb3370c4bc7d43b0e166aa1d68cc83e9
	```

