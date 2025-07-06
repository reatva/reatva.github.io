---
layout:  /src/layouts/ProjectLayout.astro
title: 'Vulnerable Active Directory Lab'
author: Adrian Reategui
pubDate: 2025-06-13
description: 'A professionally structured Active Directory (AD) lab environment designed for hands-on learning and security testing.'
languages: []
image:
  url: "/images/projects/adlab51.jpg"
  alt: "A professionally structured Active Directory (AD) lab environment designed for hands-on learning and security testing."
tags: 
  [
    
  ]
--- 

## 🛠️ Overview
This lab is a practical, enterprise-grade simulation of a misconfigured Windows domain environment. The lab is designed to mirror real-world Active Directory environments commonly found in corporate networks, complete with intentional misconfigurations that enable initial access, privilege escalation, lateral movement, and full domain compromise.

![Alt text](/images/posts/diagram.jpg)

## 🔗 Github Repository
[View the full project on Github](https://github.com/reatva/Vulnerable-Active-Directory-Lab)

## 🔍 Key Objectives

- Simulate a production-like Windows domain environment
- Practice realistic Active Directory attack chains
- Demonstrate enumeration, privilege escalation, and persistence techniques
- Serve as a practical red/blue team portfolio piece

## 🔐 Lab Highlights 

- Automated misconfigurations for Windows Server 2016 and Windows 10 clients
- Privilege Escalation Paths: Reset Password, DCSync
- Walktrough OSCP Style + Template using Sysreptor
- Graph-based path discovery using **BloodHound**

## 🔄 Attack Flow Summary

Initial Access → SMB Enumeration → Privilege Escalation → Domain Admin → Persistence

## 🧰  Tools & Technologies
- **VM Management**: VMware / VirtualBox
- **AD Services**: Active Directory DS
- **Tools**: BloodHound
- **Enumeration & Exploitation**: SMB, LDAP, RDP, Kerberos, GPP
- **OS Platforms**: Windows10, Windows Server 2016, Kali Linux

## ⚠️ Disclaimer
> This lab was created for educational and red teaming purposes only. All actions were performed in isolated lab environments under controlled conditions.


