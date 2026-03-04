---
layout:  /src/layouts/ProjectLayout.astro
title: "Weaponized Installer Lab"
author: Adrian Reategui
pubDate: 2025-07-06
description: "Simulates realistic payload delivery using Sliver C2, shellcode encryption, and a trojanized installer."
languages: []
image:
  url: "/images/projects/Weaponized/weaponized_bg.webp"
  alt: "Offensive security simulation project designed to replicate real-world payload delivery techniques."
tags: 
  [
    
  ]
--- 
## 🛠️ Overview
**Weaponized Installer Lab** is an offensive security simulation project designed to replicate real-world payload delivery techniques. This labs walks through building a trojanized installer that delivers encrypted Sliver shellcode, simulating a user falling victim to a social engineering attack.
The project aims to highlight practical adversary workflows from command and control (C2) setup to payload encryption, obfuscation, and final execution on a target machine.

![Alt text](/images/projects/Weaponized/attack-flow.webp)

## 🔗 Github Repository
[View the full project on Github](https://github.com/reatva/Weaponized-Installer-Lab)

## 🔍 Key Objectives
- Simulate a modern red team operation in a controlled environment
- Demonstrate payload generation, encryption , and delivery methods
- Serve as a portfolio example of realistic adversary simulation

## 🔐 Lab Highlights
- **Sliver C2** setup with HTTP listener 
- **Shellcode generation** and RC4 encryption for stealth
- **Nim Wrapper** compiled with a legitimate installer
- **Fake landing page simulation** for user interaction
- **Reverse shell** established post-installation

## 🧰 Tools & Technologies
![Alt text](/images/projects/Weaponized/Tools.png)

## 🔄 Workflow Summary
1. **Generate Sliver shellcode** ('.bin)
2. **Encrypt payload** using RC4
3. **Wrap payload** with legitimate installer using Nim
4. **Host** on a fake landing page
5. **User installs** the trojanized executable
6. **Callback to Sliver** listener for post-exploitation access

## ⚠️ Disclaimer
> This lab was created for educational and red teaming purposes only. All actions were performed in isolated lab environments under controlled conditions.





