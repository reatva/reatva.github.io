---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: BoardLight HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/boardlight_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["linux", "dolibar", "enlighten"]
languages: []
---

## SUMMARY: 
An authenticated attacker can abuse Dolibarr CMS 17.0.0 since is vulnerable to command execution via php code injection bypassing the application restrictions
We use the default admin credentials "admin:admin" to access the Dolibarr CMS admin panel, we then discover we can edit websites. We create a website and we inject a php malicious script specifiying the "<?PHP" in capital letters instead of "<?php?>" to bypass the php restrictions in the CMS. When previewing the website we can see our payload has worked and we are executing commands as the user www-data. Inside the machine we found credentials in clear text that allowed us to pivot user, listing sudoers privileges the user can run an SUID binary that allows LPE.
## NMAP SCAN
![alt](/images/posts/boardlight18.webp)
## ENUMERATION
- The nmap scan report us the existence of a HTTP server running on port 80, we then inspect it using Firefox without finsing anything that we can use to gain access to the system, however we found a domain that we add to our /etc/hosts file
	![alt](/images/posts/boardlight19.webp)
- When using fuff to discover different subdomain we found theres one crm so we inspec it 
	![alt](/images/posts/boardlight20.webp)
- Inside the admin panel we can edit any website, furthemore we can create one and add our malicious PHP payload to execute commands on the machine. We have to create a new website and add a new page first
	![alt](/images/posts/boardlight2.webp)
	![alt](/images/posts/boardlight3.webp)
- Once we have done that we then clic on the edit HTLM content section and we type our php payload and save it
	![alt](/images/posts/boardlight4.webp)
	![alt](/images/posts/boardlight.webp)
- On the right corner we clic on the vinoculars and it opens a new window where we can see that our payload has worked and we're executing commands as the www-data user
	![alt](/images/posts/boardlight5.webp)
	![alt](/images/posts/boardlight6.webp)
- Now that we can execute commands we're gonna open up our listener and send us a revershell to our attacker machine
	![alt](/images/posts/boardlight7.webp)
	![alt](/images/posts/boardlight8.webp)
- Once inside the system we went back one directory from the actual one we where and we found a conf directory
	![alt](/images/posts/boardlight9.webp)
- We then found a conf.php file and when we inspect its content we found the credentials in clear text of the database
	![alt](/images/posts/boardlight10.webp)
- We save the credentials for later and we double check if there's another user by listing the home directory and we found another user called larissa and with the credential we found we're gonna try to change as larissa and since this user is reusing the database password we can convert to her successfully
	![alt](/images/posts/boardlight12.webp)
	![alt](/images/posts/boardlight13.webp)
## LOCAL.TXT
- ![alt](/images/posts/boardlight17.webp)
## PRIVILEGE ESCALATION (CVE-2022-37706)
- Analizing the system we found an SUID binary called enlightent, which is vulnerable to LPE
	![alt](/images/posts/boardlight14.webp)
- We then download an exploit from github and when we running it in the victim machine we got root
	![alt](/images/posts/boardlight16.webp)
## PROOF.TXT
![alt](/images/posts/boardlight15.webp)
	