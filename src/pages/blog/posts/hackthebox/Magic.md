---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: Magic HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/magic_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["file", "hijacking", "linux", "sqli", "bypassing", "sysinfo"]
languages: []
---

## SUMMARY
>When bypassing the authentication panel in the HTTP server using a basic SQL Injection it leads to an admin panel where an attacker can upload files and access to the remote machine by crafting a php payload.The http server is prone to ssql injection which let us access as the admin user to a panel where we can upload files, whe then realize we can upload php files using double extension on our payload and modifying the magic numbers on burpsuite when making the request being able to access to the images directory and send a revershell to our kali machine
## NMAP
![alt](/images/posts/magic22.webp)
## ENUMERATION
- There a web server running on port 80, when accessing we found there's a login section 
	![alt](/images/posts/magic8.webp)
- When trying to inject a sql payload we realize we can use spaces
	![alt](/images/posts/magic9.webp)
- We send the request to burpsuite to bypass the restriction and change the payload,  we then recevied a 302 status code and we forward the request
	![alt](/images/posts/magic6.webp)
	![alt](/images/posts/magic7.webp)
- After forwarding the request we are able to access as the admin user and we can upload images
	![alt](/images/posts/magic3.webp)
- when trying different payloads we were able to bypass the format restriction by adding the jpg magic number and adding a double extension to the payload
	![alt](/images/posts/magic4.webp)
	![alt](/images/posts/magic5.webp)
- We access to the directory were the files are upload, we open up our listener and we trigger our payload
	![alt](/images/posts/magic23.webp)
	![alt](/images/posts/magic.webp)
- As www-data we navigate a few directories back and we found a db.php file which when catting reveal credentials of the database user
	![alt](/images/posts/magic24.webp)
- The found theres a mysql service running on port 3306
	![alt](/images/posts/magic25.webp)
- We use chisel to access the port 3306 from our kali machine 
	![alt](/images/posts/magic11 1.webp)
	![alt](/images/posts/magic10.webp)
- we then inspect the database and we were able to find some other credentials
	![alt](/images/posts/magic12.webp)
- With the credentials we found we are able to become theseus
	![alt](/images/posts/magic13.webp)
## LOCAL
![alt](/images/posts/magic14.webp)
## PRIVILEGE SCALATION
- Inspecting theseus groups we found hes inside the users group
	![alt](/images/posts/magic15.webp)
- We found there's a SUID binary that can be executed by the users group
	![alt](/images/posts/magic16.webp)
- With strings we found there are some commands that aren't using the full path 
	![alt](/images/posts/magic17.webp)
- We're gonna create our own lshw file with a malicious payload to apply a path hijacking
	![alt](/images/posts/magic18.webp)
	![alt](/images/posts/magic19.webp)
- When analyzing the bash permissions we found we were able to convert it to SUID 
	![alt](/images/posts/magic20.webp)
## ROOT
![alt](/images/posts/magic21.webp)