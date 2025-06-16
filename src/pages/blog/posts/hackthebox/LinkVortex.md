---
layout: /src/layouts/MarkdownPostLayout_HTB.astro
title: LinkVortex HackTheBox Write-Up
author: Adrian Reategui
description: ""
image:
  url: "/images/posts/lv_bg.png"
  alt: ""
pubDate: 2025-06-14
tags:
  ["hackthebox", "tjnull", "writeup", "linkvortex"]
languages: []
---

## NMAP
![alt](/images/posts/lv.webp)
## ENUMERATION
- The web server redirects to `linkvortex.htb`, so we added it to our `/etc/hosts` file and took a look at the website. After analyzing the site, we didn’t find any vulnerabilities that would allow us to gain access to the system.
	![alt](/images/posts/lv2.webp)
- We enumerated existing directories searching for valuable information, and fortunately, we found a `robots.txt` file.
	```
	ffuf -c --fc=404,301 -t 200 -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -u http://linkvortex.htb
	```
	![alt](/images/posts/lv9.webp)
- We inspected the `robots.txt` file using Firefox and found several URLs inside it. The one for `ghost` caught our attention the most, so we decided to access it.
	![alt](/images/posts/lv10.webp)
- We accessed the "ghost" directory in Firefox and found the CMS administration panel.
	![alt](/images/posts/lv11.webp)
- We tried to authenticate using the username `admin@linkvortex.htb`, and from the error message, we can assume the user is valid. However, we don’t have the password to access the account. We’ll set this aside for now and continue enumerating the web server, focusing our attention on subdomains.
	![alt](/images/posts/lv12.webp)
- Using ffuf, we launched a subdomain discovery attack and found the subdomain `dev`. We added this to our `/etc/hosts` file so we could access the page from Firefox.
	```
	ffuf -c --fc=404,301 -t 200 -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -H "Host: FUZZ.linkvortex.htb" -u http://linkvortex.htb
	```
	![alt](/images/posts/lv3.webp)
- From Firefox, nothing appears to be publicly exposed, so we will try enumerating directories within this subdomain.
	![alt](/images/posts/lv4.webp)
- While enumerating directories with the fuzzing tool, we discovered a `.git` directory along with others related to it.
	```
	ffuf -c --fc=404 -t 200 -w /usr/share/SecLists/Discovery/Web-Content/dirsearch.txt -u http://dev.linkvortex.htb/FUZZ
	```
	![alt](/images/posts/lv5.webp)
- Since this is a GitHub project, we could recursively download the files to search through commits. However, this didn’t reveal any useful information for gaining system access. Therefore, we will use the tool [GitHack](https://github.com/lijiejie/GitHack) (we can also use `gitdumper.py`) to reconstruct the project and obtain exploitable information.
	```
	python3 GitHack http://dev.linkvortex.htb/.git/
	```
	![alt](/images/posts/lv6.webp)
- This creates a folder with the same name as the URL, so we will inspect its contents.
	![alt](/images/posts/lv7.webp)
- We found a JavaScript file related to authentication in the admin panel, so we used grep to filter for the word "password."
	![alt](/images/posts/lv8.webp)
- We found plaintext passwords, so we will try them on the admin authentication panel.
	```
	admin@linkvortex.htb
	OctopiFociPilfer45
	```
	![alt](/images/posts/lv13.webp)
- Once inside the admin panel, we didn’t find anything that could help us access the system. However, using Wappalyzer, we obtained the CMS version, so we will look for an exploit targeting that version.
	![alt](/images/posts/lv14.webp)
- In our search, we found CVE-2023-400028, which allows us to read internal files on the machine.
	![alt](/images/posts/lv15.webp)
- We cloned the repository with `git clone` and executed the exploit.
	```
	git clone https://github.com/0xDTC/Ghost-5.58-Arbitrary-File-Read-CVE-2023-40028
	./CVE-2023-40028 -u admin@linkvortex.htb -p OctopiFociPilfer45 -h http://linkvortex.htb
	```
	![alt](/images/posts/lv16.webp)
- It’s worth noting that during our project reconstruction, we found a `Dockerfile.ghost` file, which, upon inspection, revealed the exact path to the configuration file.
	![alt](/images/posts/lv21.webp)
- Attempting to read from the path `/var/lib/ghost/config.production.json`, we found a username and plaintext credentials, which we will try to use to connect via SSH.
	![alt](/images/posts/lv19.webp)
## LOCAL
- When attempting to connect via SSH, we gained access to the system as the user `bob` on the victim machine.
	![alt](/images/posts/lv20 1.webp)
## PRIVILEGE ESCALATION
- Once on the victim machine, we found that the user `bob` has sudo privileges allowing them to execute a script called `clean_symlink.sh`.
	![alt](/images/posts/lv22.webp)
- We analyzed the script to see how we could exploit it.
	![alt](/images/posts/lv23.webp)
- The script indicates that to view the content, we need to set the variable `CHECK_CONTENT` to `true`. Additionally, the script checks symbolic links: if the file passed is a symlink and its name contains “etc” or “root,” it will delete it. However, if we create a symbolic link from `/root/.ssh/id_rsa` to a text file, and then create another symbolic link to that text file with a `.png` extension, we can bypass the check since this second symlink's name doesn’t include “root.”
	```
	ln -s /root/.ssh/id_rsa r.txt
	ln -s /home/bob/r.txt r.png
	```
	![alt](/images/posts/lv24.webp)
- We proceed to execute the script. Since it doesn’t perform recursive name checks, our symlink named `r.png` will be processed successfully.
	![alt](/images/posts/lv25.webp)
- We successfully obtained root’s `id_rsa`! Now, we copy root’s `id_rsa` into a file with the same name, setting its permissions to `600` so we can connect via SSH.
	```
	nano id_rsa
	chmod 600 id_rsa
	ssh root@10.10.11.47 -i id_rsa
	```
	![alt](/images/posts/lv26.webp)