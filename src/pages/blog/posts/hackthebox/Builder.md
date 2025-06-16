---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: Builder HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/builder_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["hackthebox", "tjnull", "writeup", "jenkins"]
languages: []
---


## SUMMARY 
Jenkins version running on port 8080 is vulnerable to Local File Inclusion which allows an unauthenticated atacker to read arbitrary files on the jenkins controller file system. We then dump the configuration files from the jenkins directory finding the user jennifer credentials that give us access to the jenkins control panel 
## NMAP
![alt](/images/posts/builder2.webp)
## ENUMERATION
- We found a service jenkins running on port 8080 and we also fond its version
	![alt](/images/posts/builder3.webp)
- We found with searchexploit that the current version of jenkins is vulnerable to Local File Inclusion
	![alt](/images/posts/builder4.webp)
- We then run the script to find jenkin's user configuration files 
	![alt](/images/posts/builder6.webp)
- We found there's a jennifer user so we're gonna use the script to retrieve its information
	![alt](/images/posts/builder7.webp)
- We then crack the hash using john and we are able to obtain the users password in clear text
	![alt](/images/posts/builder8.webp)
- With the username and the password we found we're gonna log in into the jenkins panel
	![alt](/images/posts/builder9.webp)
## LOCAL FLAG
![alt](/images/posts/builder14.webp)
## PRIVILEGE ESCALATION 
- We found the user's root credentials configiuration file which we can dump using jenkins CLI, we retrieve the id_rsa from the user's root and we gain access to the system with maximun privileges.
- When trying to retrieve information from jenkin's configuration files we found the credentials hash of the user root
	![alt](/images/posts/builder10.webp)
- We also found we can dump the credentials from the jenkin's CLI and when trying to do it we got the root's id_rsa
	```bash
	https://www.codurance.com/publications/2019/05/30/accessing-and-dumping-jenkins-credentials
	println hudson.util.Secret.decrypt("{Key_Value}")
	```
	![alt](/images/posts/builder11.webp)
- We then save the id_rsa in a txt file and we change permission to connect to the victim machine gaining access as the user root
	![alt](/images/posts/builder12.webp)
## ROOT FLAG
![alt](/images/posts/builder13.webp)