---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: Editorial HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/Editorial/editorial_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["SSRF", "linux", "api", "git"]
languages: []
---

## SUMMARY
- The preview section of the HTTP server is vulnerable to SSRF leaking information about the internal services. We make a request to the localhost using the SSRF found in the preview section when intercepting the request, when scaning different open port trough the SSRF we found port 5000 retrieve different information, with this information we then make a new request finding clear text credentials of the user prod that we then use to connect to the victim machine trough SSH.
## NMAP
![alt](/images/posts/Editorial/editorial.webp)
## ENUMERATION
- When accessing the web server on port 80 we found we can upload documents
	![alt](/images/posts/Editorial/editorial2.webp)
- When trying to previsualize our document the preview button doesn't redirect or show us any ouput, so we open burpsuite and intercept the request
	![alt](/images/posts/Editorial/editorial3.webp)
- We found that the preview button is making a request to upload-cover and we found a bookurl parameter, we set up our python http server and introduce out IP as the content of the bookurl parameter
	![alt](/images/posts/Editorial/editorial4.webp)
	![alt](/images/posts/Editorial/editorial5.webp)
- We receive a request on our http server, let see if we can retrieve information from the localhost machine by making a request using curl
	![alt](/images/posts/Editorial/editorial6.webp)
- The request return a path with an image, when trying to inspec different port we found that port 5000 return a different ouput
	![alt](/images/posts/Editorial/editorial7.webp)
- We follow the next url http://editorial.htb/static/upload/xxxx and we found a document with information about an API
	![alt](/images/posts/Editorial/editorial8.webp)
- We found there's a message for the new authors, so we inspect that by abusing the SSRF 
	![alt](/images/posts/Editorial/editorial9.webp)
	![alt](/images/posts/Editorial/editorial10.webp)
- We found credential in clear text of the user dev and we use them connect to the victim machine through SSH
	![alt](/images/posts/Editorial/editorial11.webp)
- We found an "APP" directory in the users home directory and inside of it we found a .git directory
	![alt](/images/posts/Editorial/editorial12.webp)
- When analizing logs we found theres is one that caught our attention and is the downgrade one
	![alt](/images/posts/Editorial/editorial13.webp)
- When inspecting that log we found the prod users credentials
	![alt](/images/posts/Editorial/editorial14.webp)
## LOCAL
![alt](/images/posts/Editorial/editorial16.webp)
## PRIVILEGE ESCALATION
- We connect as the user prod and we found he can run a python script as the user root
	![alt](/images/posts/Editorial/editorial15.webp)
- We cat the script the user can run and we found there's a python module that is vulnerable to RCE
	![alt](/images/posts/Editorial/editorial17.webp)
- Doing a bit of research we found the command to abuse of this vulnerability, we first create a script that will convert the bash into an SUID binary and we run the sudoers script
	![alt](/images/posts/Editorial/editorial18.webp)
	![alt](/images/posts/Editorial/editorial19.webp)
- We then list the bash permissions and we were able to change to SUID
	![alt](/images/posts/Editorial/editorial20.webp)
- We gain user root
	![alt](/images/posts/Editorial/editorial21.webp)
## ROOT
![alt](/images/posts/Editorial/editorial22.webp)