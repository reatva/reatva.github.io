---
layout: /src/layouts/MarkdownPostLayout.astro
title: HackTheBox CWES/CBBH Exam Review & Tips
author: Adrian Reategui
description: "HackTheBox CWES (old CBBH) exam review, prep tips, exam structure, scoring, and advice on passing the certification."
image:
  url: "/images/posts/hackthebox-cwes-cbbh-exam-review.png"
  alt: "HackTheBox CWES (CBBH) certification exam review and tips."
pubDate: 2025-09-23
tags:
  [
    "HackTheBox","CBBH","CWES","Exam"
  ]
languages: []
---


I recently earned the [HackTheBox CWES certification](https://academy.hackthebox.com/preview/certifications/htb-certified-bug-bounty-hunter) (formerly CBBH), and here are my thoughts.

The course is easy to digest. Even though it uses technical language, the examples are clear and to the point. That said, a few sections could have gone a little deeper. Overall, the CWES content is well-structured and methodical. Each module lets you put what you’ve learned into practice. Take your time with the modules, and don’t hesitate to review and repeat them if needed. At the end of every module (there are 20 in total) there’s a **skill assessment**, basically a small scenario where you have to figure out which of the techniques covered applies in order to capture the flag. These assessments aren’t 100% identical to the real exam, but the mindset and analysis are very similar.

### Do you need prior experience for the CWES exam?

Because the course is straightforward, it’s easy to assume the exam will be too but that’s the wrong mindset. If you’re just starting out in pentesting and this is your first certification, I think it’s important to have some CTF experience **without relying on write-ups**. *The exam is based entirely on the course material*, but from my point of view you need strong methodology and enumeration skills. Enumeration really does make the difference and will make your life easier during the test. However, prior experience is not strictly required to pass the CWES exam.

### Rabbit holes?

Yes. You’ll definitely run into moments where you think you’ve found the right path but nothing works. If a technique from the course isn’t getting results, drop it quickly and look elsewhere.

### CWES Exam Structure

The exam gives you **five web applications** to exploit and seven days to do it. For each one you need to gain initial access and then achieve RCE to read the flag stored in the root directory. Each section has its own point value depending on difficulty. The point distribution can be interpreted as follows (though it may vary):

- Easy – 5 points
- Medium – 10 points
- Hard – 15 points

You need to collect enough flags to reach the minimum passing score of **80 points**.

### CWES Reporting and Documentation

Inside the exam panel you’ll find a Hack The Box report template that explains the required structure. Pay special attention to the last module, which covers how to write up vulnerabilities. The guidance isn’t overly detailed, but it’s more than enough to document your findings properly.

### My Top Tips to Pass the [HackTheBox CWES](https://academy.hackthebox.com/preview/certifications/htb-certified-bug-bounty-hunter) (CBBH) Exam

- Practice on a few Hack The Box machines or any similar platform before attempting the exam. 
- Review and repeat the modules and assessments as often as needed.
- Don’t approach the exam as “easy.”
- Don't try things out of the scope of the course material.
- Enumerate in as many ways as possible with different methods and wordlists. **Enumeration, again, is key.**
- For the report, tools like [Sysreptor](https://portal.sysreptor.com/demo) make the process faster.
- Use your own words for the report. AI can help polish sentences, but don’t let it write the report for you.
- Take breaks. If you don’t, you’ll hit a wall.
- Take notes and screenshots of every step you follow while exploiting the vulnerabilities, and, if possible, start building your report as you go.
- And yes, enumerate again.

### Final thoughts

I really enjoyed both the course and the exam. It wasn’t easy, but it was far from impossible. Even though I already knew many of the topics, the exam forced me to improve my web-app enumeration and to try new methods the course covers well. At the end of the day, a certification only matters if you actually learn something or shore up weak spots and this one definitely delivered.