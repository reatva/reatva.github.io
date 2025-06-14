---
layout:  /src/layouts/MarkdownPostLayout.astro
title: 'Custom vulnerable Active Directory'
author: Adrian Reategui
pubDate: 2025-06-13
description: 'A custom-built Active Directory environment designed to simulate a full attack chain (OSCP alike).'
languages: []
image:
  url: "/images/projects/adlab51.jpg"
  alt: "Thumbnail of Astro arches."
tags: 
  [
    
  ]
--- 

**Custom-built vulnerable Active Directory** environment designed to simulate a full attack chain. The lab includes intensional misconfigurations such as an exposed SMB share with users files, users accounts that are AS-REP roastable and Kerberoastable, and privilege escalation paths that allow password changes for a privilege user. Exploiting these weaknesses step-by-step leads to a successful DCSync attack and full domain compromise.

## DC Settings
### Disabling Windows Defender and Windows Updates
- We created a custom GPO to disable Windows Updates and Windows Defender, making the environment easier to exploit.
![alt](/images/projects/adlab1.png)

![alt](/images/projects/adlab2.png)
### Disabling Firewall
- We need our attacks to work so we are going to disable Windows Defender Firewall with Advanced Security
![alt](/images/projects/adlab5.png)
### AS-REP roastable user
- We created a user called *"Lucy"* and we made her AS-REP roastable by checking on *"Do not requiere Kerberos preauthentication"*.
![alt](/images/projects/adlab3.png)
### Creating user Nicol
- We created user **Nicol**, we are gonna use this user and give her SMB read permissions of a *Backups* folder we are going to create later. 
![alt](/images/projects/adlab15.png)
### Restricting LDAP queries for Nicol
- We don't want our user Nicol to list information from the Domain Controler using tools like *"rpcclient"* or *"ldapsearch"*. To do that we need to create a **New Security Group** from **Active Directory Users and Computers** and add Nicol.
```
  "Active Directory Users and Computer" > New > Group > LDAP_Deny_Group > Add > Nicol
```
![alt](/images/projects/adlab33.png)
![alt](/images/projects/adlab36.png)
- After that we are going to create a new **Group Policy Object (GPO)** 
```
  "Group Policy Management" > "Group Policy Objects" > New > Name: "Deny LDAP Access"
```
![alt](/images/projects/adlab32.png)
- We're gonna configure the new GPO to **Deny** access to lsass.exe LDAP functions.
```
  Right click on the GPO > Edit
  "Computer Configuration Policies" > "Windows Settings" > "Security Settings" > "Local Policies" > "User Rights Assignment"
```
![alt](/images/projects/adlab37.png)
- Here we are going to check **"Access this computer from the network"** and add the LDAP_Deny_Group we created earlier.
![alt](/images/projects/adlab38.png)

- As the final step we are going to link the GPO to Domain Controllers OU, we need to go to Group Policy and locate Domain controllers and follow the steps describe below. After that we have restricted the access to Nicol to query Domain information using *rpcclient* or *ldapsearch*.
```
  "Group Policy Management" > "Domain Controllers OU" > right click > "Link an existing GPO" 
```  
![alt](/images/projects/adlab40.png)
- We check that everything has worked from our Kali machine.
![alt](/images/projects/adlab41.png)
### Kerberoastable user svc_iis
- Another user was created, in this case *svc_iis* which we are going to set it up and make him a Kerberoastable account using Powershell cmd.
```powershell
  Set-ADUser -Identity svc_iis -ServicePrincipalNames @{Add="HTTP/webserver.mydomain.com"}
  setspn -l svc_iis
```
![alt](/images/projects/adlab4.png)
### Reset Password permission for svc_iis
- Once our user has been created we are going to give him the *Reset Password* permission over user *emmet*
```powershell
  dsacls "CN=emmet,CN=Users,DC=mydomain,DC=com" /G "mydomain.com\svc_iis:CA;Reset Password"
```  
![alt](/images/projects/adlab43.png)
- By uploading the data obtained from the DC to *Bloodhound* we can see how our privilege has been applied properly.
![alt](/images/projects/adlabw15.png)
### Assigning DCSync permissions to emmet
- Since our user emmet is a normal user we are going to give him permissions to do a DCSync. To do that we need to add the *Replicating Directory Changes* and *Replicating Directory Changes All* to emmet.
```
  $DomainDN = (Get-ADDomain).DistinguishedName
  dsacls $Domain /G "mudomain.com\emmet:CA;Replicating Directory Changes"
  dsacls $Domain /G "mudomain.com\emmet:CA;Replicating Directory Changes All"
```
![alt](/images/projects/adlab44.png)
![alt](/images/projects/adlab46.png)
![alt](/images/projects/adlab45.png)
![alt](/images/projects/adlab46.png)
- If we see the changes we have made in *Bloodhound* we can see how *emmet* is now capable of do a *DCSync* on the Domain Controller. This permission allows the user to dump hashes of the Domain including the Administrator.
![alt](/images/projects/adlabw16.png)

## CLIENT 1
### Disabling Defender
- We have to keep in mind that this machine needs to have the Windows Defender disable.
```powershell
   Set-MpPreference -DisableRealTimeMonitoring $true
   New-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Defender" -Name DisableAntiSpyware -Value 1 -PropertyType DWORD -Force
```
![alt](/images/projects/adlab10.png)
### Adding user to RDP
- Adding Domain user Adrian to *"RDP group"* on CLIENT1, when executing the command for the second time it gives us an error meaning that the user is already in the group.
```powershell
  Add-LocalGroupMember -Group "Remote DEsktop USers" -Member "mydomain.com\adrian"
```
![alt](/images/projects/adlab47.png)
### Setting SeImpersonatePrivilege
- We're gonna add the **SeImpersonatePrivilege** to Adrian from the Local Security, this privilege will allow the user to impersonate an Administrator user.
```
  "Windows Administrative Tools" > "Local Security Poliy" > "Local Policies" "USer Rights Assignment" > "Impersonate client after authentication"
```
![alt](/images/projects/adlab48.png)
### Enabling RDP
- Since our user is part of the **"Remote Desktop Users"** we are going to enable port 3389 from windows registry.
```
  Registry > HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server
  Set fDenyTSConnections 0
```
![alt](/images/projects/adlab7.png)
### Modifying Administrator's powershell history
- We are going to modify the Administrator's Powershell history adding Nicol's password in plain text to let us jump to CLIENT2
![alt](/images/projects/adlab49.png)

## CLIENT 2
### Sharing SMB Folder
- As we mentioned earlier, we are going to create a **Backups** share folder and assign reading permissions to Nicol. We are going to delete Everyone as we only want Nicol to be able to see the contents of this share.
```
  C:\ > mkdir "Backups"
```
![alt](/images/projects/adlab17.png)
### Enabling local shares to Domain Users
- After setting up the share folder, we are going to modify the registry to enable local shares to be accesible by users from the Domain, we will have to create a new DWORD registry in the following path.
```
  Registry > HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\service\LanmanWorksatation\Parameters
  Right Click > New > DWORD Value(32-bit) > AllowInsecureGuestAuth
```
![alt](/images/projects/adlab18.png)

> Some steps like Creating a Domain Controller and joining machines to it have been omited since there is a lab I created showing all the steps required.

## Lab Features

- Active Directory Domain: Joined machines
- Vulnerable User Accounts: Kerberoasting, AS-REProastable
- Privilege Escalation Paths: Reset Password, DCSync
- Hardening Bypass on CLIENT1: RDP Access, SeImpersonatePrivilege
- Exploitable SMB share on CLIENT2: SMB share

## Lab Objective

The goal of this lab is to simulate a realistic attack chain in an Active Directory environment. It shows how common misconfigurations and overlooked settings can be combined to compromise an entire domain.



