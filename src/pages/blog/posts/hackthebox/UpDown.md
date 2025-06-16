---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: UpDown HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/updown_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["linux", "LFI", "phar", "fileupload"]
languages: []
---

## NMAP
![alt](/images/posts/updown.webp)
## ENUMERATION
- Since there aren't more open ports we're gonna start enumerating port 80 
	![alt](/images/posts/updown2.webp)
- Running ffuf agains the main url it discovered a "dev" directory which we also enumerate, inmediatly ffuf found for us a hidden git directory
	![alt](/images/posts/updown4.webp)
	![alt](/images/posts/updown5.webp)
- Now that we found a git repository we're gonna dump it with git-dumper tool, this creates a directory with files that weren't visible before	
	![alt](/images/posts/updown6.webp)
	![alt](/images/posts/updown7.webp)
- Before analizing the files we just dumped we're gonna analize the git commits
	![alt](/images/posts/updown8.webp)
- We found an interesting log mentioning a dev vhost, when we have a look at the commit it shows us that we need a special header in order to make it visible
	![alt](/images/posts/updown9.webp)
- With ffuf we enumerate the host for possibles subdomains and we found the "dev" domain we found in the git commit
	```bash
	ffuf -c --fc=404 --fw=186 -t 200 -w /usr/share/SecLists/Discovery/DNS/subdomains-top1million-110000.txt -H "Host: FUZZ.siteisup.htb" -u http://siteisup.htb
	```
	![alt](/images/posts/updown3.webp)
- We have discovered the dev subdomain with ffuf however we obtain a 403 status code which means that we can't access, using burpsuite we're gonna add the Special-Dev header we found in the git repository commit accessing the proxy options
	![alt](/images/posts/updown10.webp)
- Once we've done we also add the subdomain in our /etc/hosts file, and now we're able to access to de "dev" subdomain where we found something similar that port 80
	![alt](/images/posts/updown11.webp)
- The files we got from dumping the git repository seems to be related to this website so we're gonna start analizing the checker.php file. After reading the code we found the upload functionality where we found some file restrictions and the existence of an uploads directory
	![alt](/images/posts/updown12.webp)
- Back to the url we also found the admin panel where we found in the url what it seems to be a LFI
	![alt](/images/posts/updown13.webp)
- After some attempts to retrieve files from the system we try to use php wrappers and we were able to retrieve the index php code in base64
	![alt](/images/posts/updown14.webp)
	![alt](/images/posts/updown15.webp)
- We know now that the admin url is vulnerable to LFI and we can use php Wrappers. Now we're gonna focus our attention in the file upload section of the url, since the webpage reads php we're gonna create a file with a php instruccion that will let us see the phpinfo page
	![alt](/images/posts/updown17.webp)
	![alt](/images/posts/updown16.webp)
- Seems like our files are being erased and we can't see the content, however we can zip our files and since we can use php wrappers we can try to read the content with the wrapper phar 
	![alt](/images/posts/updown18.webp)
- We are going to upload this file and then we'll have a look at the uploads directory. We were able to upload the file and having a look ath the downloads folder we can find our jpg file, however from this url we can't see the content but luckly for us we can try to read it using the wrapper phar from the admin panel
	![alt](/images/posts/updown19.webp)
	![alt](/images/posts/updown20.webp)
- We we're able to read the phpinfo file, having a look at the disable functions we have lots of them that won't let us gain access to the system however there's one that its not blocked that we can try to abuse which is proc_open
	![alt](/images/posts/updown21.webp)
- Now that we can use phar wrapper to read content we're gonna create our revershell payload using proc_open function 
	![alt](/images/posts/updown22.webp)
- Once created we need to zip our payload like we did before, once its done we can then upload it and trigger it using the admin url LFI
	![alt](/images/posts/updown23.webp)
	![alt](/images/posts/updown24.webp)
	![alt](/images/posts/updown25.webp)
- We received a connection from the victim machine as the user www-data
	![alt](/images/posts/updown26.webp)
- Enumerating the system we found insteresting files inside the developer user
	![alt](/images/posts/updown27.webp)
- As we can see there is a SUID binary and what it seems to be the main script, reading the script we see that its using a vulnerable python function which is input, so we're gonna abuse this and pivot user 
	![alt](/images/posts/updown28.webp)
## LOCAL
![alt](/images/posts/updown33.webp)
## PRIVILEGE ESCALATION
- As the user developer we list our sudoers privileges and we found that we can execute easy_install binary as any user
	![alt](/images/posts/updown29.webp)
- We found a way to obtain a shell in gtfobins so we're gonna follow the steps
	![alt](/images/posts/updown30.webp)
	![alt](/images/posts/updown31.webp)
## ROOT
![alt](/images/posts/updown32.webp)
