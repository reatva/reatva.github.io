---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: Keeper HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/keeper_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["putty", "ppk", "linux", "keepass"]
languages: []
---
## NMAP
![alt](/images/posts/keeper.webp)
## ENUMERATION
- We access the HTTP server through Firefox and we found there is a virtual hosting domain and we proceed to add it to our /etc/hosts/ file
	![alt](/images/posts/keeper2.webp)
- Once added to our /etc/hosts file we proceed to inspect the webpage 
	![alt](/images/posts/keeper3.webp)
- There is a Request Tracker service running on the domain, doing a bit of a research we found that the default credentials to access the service are root:password, since we don't have any credentials we give it a go and we gain access to the service's admin panel
	![alt](/images/posts/keeper4 1.webp)
	![alt](/images/posts/keeper5.webp)
- Analaizing the service we found a user section under the Admin window, and we found the name of a user lnorgaard which we will inspect
	![alt](/images/posts/keeper6.webp)
- When clicking on the users name we found that theres a comment with credentials in clear text 
	![alt](/images/posts/keeper7.webp)
- When inspecting a bit more we found a ticket complaining about issues with Keepass client on Windows, where we found that the user has saved the file in his home directory
	![alt](/images/posts/keeper9.webp)
- With the credentials that we found we connect trough ssh to the system satisfactory
	![alt](/images/posts/keeper8.webp)
## LOCAL
![alt](/images/posts/keeper19.webp)
## PRIVILEGE ESCALATION
- Listing the users directory we found a ZIP file which we download opening an http server with python
	![alt](/images/posts/keeper10.webp)
- Once downloaded we extract the contentes of the ZIP file and we found a keepas dump and a keepass database file
	![alt](/images/posts/keeper11.webp)
- Doing a research we found there is a tool in [github](https://github.com/matro7sh/keepass-dump-masterkey) to retrieve the master key from the keepass database using a dump file
	![alt](/images/posts/keeper12.webp)
- The tool dump the password but seems to be specials characteres within, we copied and pasted on google and we found something related to it 
	![alt](/images/posts/keeper13.webp)
- We try the password we found on the keepassxc GUI
	![alt](/images/posts/keeper14.webp)
- We gain access and we found a Putty rsa file of the user root
	![alt](/images/posts/keeper15.webp)
- With this file we can try to obtain a valid id_rsa for the user root, we create a id_rsa.ppk file and using puttygen we're gonna try to obtain the id_rsa
	![alt](/images/posts/keeper16.webp)
- Now that we've got an id_rsa were gonna access trough ssh with the user root
	![alt](/images/posts/keeper17.webp)
## ROOT
![alt](/images/posts/keeper18.webp)