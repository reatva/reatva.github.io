---
layout:  /src/layouts/ProjectLayout.astro
title: 'Threat Hunting & Incident Response Lab'
author: Adrian Reategui
pubDate: 2025-06-13
description: 'Threat Hunting & Incident Response Lab is a hands-on project designed to simulate realistic detection, investigation, and response workflows using Microsoft Sentinel and Defender for Endpoint.'
languages: []
image:
  url: "/images/projects/threathunting.jpeg"
  alt: "Threat Hunting & Incident Response Lab is a hands-on project designed to simulate realistic detection, investigation, and response workflows using Microsoft Sentinel and Defender for Endpoint."
tags: 
  [
    
  ]
--- 

## 🛡️ Overview

**Threat Hunting & Incident Response Lab** is a hands-on project designed to simulate realistic detection, investigation, and response workflows using Microsoft Sentinel and Defender for Endpoint. This lab supports blue team training, purple team collaboration, and practical portfolio demonstrations.

## 🔗 GitHub Repository  
[View the full project on GitHub](https://github.com/reatva/Threat-Hunting-Incident-Response-Lab)

## 🎯 Key Objectives

- Build a proactive threat hunting workflow using real telemetry
- Execute reactive incident response playbooks
- Investigate and respond to realistic adversary techniques
- Document scenarios and share learnings

## 🏗️ Lab Architecture

- **Microsoft Sentinel**: SIEM / SOAR 
  - Log Analytics workspace, alerting, playbooks.  
- **Defender for Endpoint**: EDR on all Windows hosts
  - Telemetry, isolation, live response.
- **Azure VM**: Threat-hunted endpoint
  - Windows 10 Pro with telemetry integration.

## 🧰 Tools & Technologies

- **SIEM & SOAR**: Microsoft Sentinel
- **EDR**: Microsoft Defender for Endpoint
- **Infrastructure**: Microsoft Azure
- **Query Language**: Kusto Query Language (KQL)

## 🔍 Lab Highlights

- **7-Step Threat Hunting Framework** integrated in every scenario
- **MITRE ATT&CK Mapping** for attacker TTPs
- **Reusable KQL Snippets** to speed up deployment
- Real-world scenarios for **hunting and response training**

## 📘 Scenario Overview

### 🚨 Threat Hunting Response Scenarios

- **TH Scenario 1** – Data Exfiltration from PIP'd Employee  
- **TH Scenario 2** – Suspicious/Unauthorized Tor Usage  

### 🚨 Incident Response Scenarios

- **IR Scenario 1** – Internet-Facing Brute Force  
- **IR Scenario 2** – Suspicious Web Request

## 🔄 Example Workflow

1. **Preparation** – Form hypothesis based on anomalies  
2. **Data Collection** – Ensure ingestion of relevant tables  
3. **Analysis** – Run KQL queries to surface indicators  
4. **Investigation** – Pivot into file/process logs, map to MITRE ATT&CK  
5. **Containment** – Isolate systems via Defender for Endpoint  
6. **Eradication** – Remove persistence or malware  
7. **Recovery & Improvement** – Restore service, update detections

## ⚠️ Disclaimer

> This project is for **educational purposes only**. Do not attempt these techniques in unauthorized environments.



