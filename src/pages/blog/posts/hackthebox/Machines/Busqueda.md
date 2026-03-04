---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: Busqueda HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/Busqueda/busqueda_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["docker", "linux", "searchor"]
languages: []
---

## NMAP
![alt](/images/posts/Busqueda/busqueda.webp)
## FOOTHOLD
- We only found two open ports, so we focused on analyzing port 80. When we ran WhatWeb, it redirected us to the subdomain searcher.htb.
	![alt](/images/posts/Busqueda/busqueda2.webp)
- Analyzing the website, we didn’t find anything through directory or subdomain fuzzing, but we did find a version number, which we will use to search for vulnerabilities or any exploits related to the service.
	![alt](/images/posts/Busqueda/busqueda3.webp)
- We found an exploit on GitHub that abuses poor code implementation involving the use of eval. This exploit allows us to gain access to the victim machine.
	![alt](/images/posts/Busqueda/busqueda4.webp)
- We gained access to the victim machine as the user svc, and after a quick enumeration of the hostname, we found that it has multiple network interfaces. 
	![alt](/images/posts/Busqueda/busqueda5.webp)
- Inside the directory we accessed through the reverse shell, we listed the hidden files and found a .git directory. We explored it to see the files it contained.
	![alt](/images/posts/Busqueda/busqueda6.webp)
- We found a configuration file and inspected it. This file provided us with plaintext credentials for a user named cody, and also revealed a subdomain that we hadn’t found during our initial fuzzing. This suggests that the service might be running on an internal port of the victim machine.
	![alt](/images/posts/Busqueda/busqueda7.webp)
- By adding the discovered subdomain to our /etc/hosts file and trying to access it with Firefox, we found that we could reach the Gitea service. Using the credentials we found, we attempted to authenticate.
	![alt](/images/posts/Busqueda/busqueda8.webp)
## PRIVILEGE ESCALATION
- However, we didn’t find any useful information to exploit, so our next approach was to try the discovered password with sudo -l.
	![alt](/images/posts/Busqueda/busqueda9.webp)
- We found that the password is valid and that we can run a custom script owned by root. When executing the script, we noticed that it uses Docker in the background.
	![alt](/images/posts/Busqueda/busqueda10.webp)
- We saw there is a docker ps command, which we used to check the available Docker containers and found one for Gitea and another for MySQL_db.
	![alt](/images/posts/Busqueda/busqueda11.webp)
- We also found a docker-inspect command, which we can use to list information about a specific image in JSON format via the console. Since we can list image names with docker ps (also included in the script), we’ll leverage this to list the printable content of the Gitea image.
	![alt](/images/posts/Busqueda/busqueda12.webp)
- Within all the output the command prints to the screen, we found useful information such as credentials for the Gitea database.
	![alt](/images/posts/Busqueda/busqueda13.webp)
- With the password we found, we successfully logged in as the administrator user on the Gitea service. There, we found the source code of the scripts and noticed that one of them is being called using a relative path. 
	![alt](/images/posts/Busqueda/busqueda14.webp)
- Upon discovering that the script is called using a relative path instead of an absolute one, we can perform a script hijacking by creating our own malicious script in the `/tmp/test` directory and modifying the `PATH` environment variable.
	![alt](/images/posts/Busqueda/busqueda15.webp)
- Now, all that’s left is to execute the script using `sudo` and verify if our changes took effect — and indeed, they did.
	![alt](/images/posts/Busqueda/busqueda16.webp)
## ROOT
- We become root
![alt](/images/posts/Busqueda/busqueda17.webp)
