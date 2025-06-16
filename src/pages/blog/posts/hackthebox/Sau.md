---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: Sau HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/sau_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["hackthebox", "baskets", "SSRF"]
languages: []
---

## NMAP
![alt](/images/posts/sau7.webp)
## ENUMERATION
- Nmap found a HTTP service running on port 55555, so we had a look at it through Fiirefox and we found a Requests Baskets v 1.2.1
	![alt](/images/posts/sau8.webp)
- We're gonna create a basket to access to the panel and have a better look at the application
	![alt](/images/posts/sau9.webp)
- We can make a request with curl to the speciofy url and it should appear on the panel
	![alt](/images/posts/sau10.webp)
- We also found that on the configuration settings we can forward the request to a specific url, so we're gonna try to do it to the localhost
	![alt](/images/posts/sau11.webp)
- We then send a GET request using curl to the basket and we recevied html content, so we use html2text to have a look at the content and we found a service that seems to be running on port 80 and its version
	![alt](/images/posts/sau12.webp)
- As we can see this version os Request BAskets seems to be vulnerable to SSRF and we doing a bit of research online we could found a exploit 
	![alt](/images/posts/sau2.webp)
- since we also foun the MAltrail version we could also find a RCE exploit for this version
	![alt](/images/posts/sau3.webp)
- The exploit only needs our IP and listener port and the URL where the service is being hosted which thanks to SSRF we can access to it, we start our listener in port 1337 and we gain access to the system
	![alt](/images/posts/sau.webp)
## LOCAL
![alt](/images/posts/sau14.webp)
## PRIVILEGE ESCALATION
- As the user puma we found that we have a sudoers permission and we can execute a command, when we try to run the command we enter in the scroll mode page where we can use the special character ! to escape and gain access as the user root
	![alt](/images/posts/sau6.webp)
## ROOT
![alt](/images/posts/sau13.webp)