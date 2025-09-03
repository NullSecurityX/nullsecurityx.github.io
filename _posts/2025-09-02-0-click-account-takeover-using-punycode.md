---
title: "0-Click Account Takeover Using Punycode Emails for Access"
layout: post
tags: [Punycode, IDN, Unicode, email-security, account-takeover, phishing, parsing, exploit, hacking, cybersecurity]
image: assets/images/punycode.png
---


# 0-Click Account Takeover Using Punycode Emails for Access --- Technical Analysis (Security / Research Purpose)

> **IMPORTANT ETHICAL NOTE:** This document is **not intended** to
> provide step-by-step exploit guidance for unauthorized access to real
> systems. No operational instructions for domain registration, DNS/MX
> manipulation, or malicious scripts are included. The goal is to
> provide a deep technical analysis of IDN/Punycode attack surfaces,
> normalization pitfalls, and reproducible, harmless research/lab
> demonstrations.

------------------------------------------------------------------------

## Abstract

This paper analyzes in detail how **Punycode / IDN** encoding of email
domains and Unicode confusable characters can introduce ambiguity into
email-based authentication flows (password reset, magic links, email
verification). We cover Unicode normalization, code-point level
comparisons, email parsing pitfalls, database collation effects, and
provide programmatic test harnesses (safe, local-only) to illustrate the
mechanics.

## Threat Model (High-Level)

-   **Target:** Applications relying on email-based authentication
    (password reset, magic links, verification).
-   **Attacker Goal:** Exploit confusable email addresses via
    Unicode/Punycode ambiguities.
-   **Constraint:** Document does *not* include instructions for
    operational exploit steps (DNS, MX, or email routing manipulations).

------------------------------------------------------------------------

## Technical Background --- IDN / Punycode / Unicode Pitfalls

-   **IDN (Internationalized Domain Names):** Mechanism to allow Unicode
    characters in domain names by encoding to ASCII.
-   **Punycode:** Algorithm encoding Unicode into ASCII-compatible form.
    ACE strings start with `xn--`.
-   **Homoglyphs / Confusables:** Different Unicode code points that
    render visually identical (Latin `a` vs Cyrillic `а`).
-   **Unicode Normalization (NFC, NFD, NFKC, NFKD):** Mechanisms to
    unify visually identical but code-point-different character
    sequences.

### Example Visual Ambiguity

-   `gmail.com` (normal Latin)
-   `gｍail.com` (`ｍ` is U+FF4D FULLWIDTH LATIN SMALL LETTER M)

The two render almost identically but are completely different strings
at code-point level.

------------------------------------------------------------------------

## Email Address Anatomy & Mismatch Points

-   **Local-part** (`"local"@domain`) and **domain-part**. Routing
    depends on domain-part.
-   **SMTP envelope vs header:** Applications may use `To:` header vs
    actual SMTP `RCPT TO`. Discrepancies can occur.
-   **Comparison errors:** Raw string equality vs normalized
    ACE/Punycode equality.

------------------------------------------------------------------------

## Code Demonstrations (Safe / Non-Operational)

### 1) Python: IDNA and Code Point Inspection

``` python
import idna
import unicodedata

unicode_domain = 'g\uff4dail.com'  # g + U+FF4D FULLWIDTH m + ail.com

ace = idna.encode(unicode_domain).decode('ascii')
print('ACE (Punycode):', ace)

decoded = idna.decode(ace)
print('Decoded:', decoded)

def codepoints(s):
    return ' '.join([f'U+{ord(c):04X}' for c in s])

print('Codepoints:', codepoints(decoded))

plain = 'gmail.com'
print('plain == decoded ?', plain == decoded)
print('NFC comparison:', unicodedata.normalize('NFC', plain) == unicodedata.normalize('NFC', decoded))
```

------------------------------------------------------------------------

### 2) Node.js Example

``` js
const punycode = require('punycode/');

const unicode = 'g\uFF4Dail.com';
const ace = punycode.toASCII(unicode);
console.log('ACE:', ace);
console.log('Decoded:', punycode.toUnicode(ace));

function codePoints(s) {
  return Array.from(s).map(c => 'U+' + c.codePointAt(0).toString(16).toUpperCase()).join(' ');
}
console.log('Codepoints:', codePoints(unicode));
```

------------------------------------------------------------------------

### 3) Go Example

``` go
package main

import (
  "fmt"
  "golang.org/x/net/idna"
)

func main() {
  unicode := "g\uFF4Dail.com"
  p, _ := idna.ToASCII(unicode)
  fmt.Println("ACE:", p)
  d, _ := idna.ToUnicode(p)
  fmt.Println("Decoded:", d)
}
```

------------------------------------------------------------------------

### 4) Regex Pitfalls

``` regex
^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$
```

Fails with Unicode confusables. Example:

``` python
import re
pattern = re.compile(r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')

addresses = [
    'victim@gmail.com',
    'victim@g\uff4dail.com',
    'user@xn--example-123.com'
]

for addr in addresses:
    print(addr, '-> match?', bool(pattern.match(addr)))
```

------------------------------------------------------------------------

### 5) Database Collation

``` sql
CREATE TABLE users (
  id serial PRIMARY KEY,
  email TEXT
);

INSERT INTO users (email) VALUES ('victim@gmail.com');

SELECT id, email FROM users WHERE email = 'victim@g\uFF4Dail.com';
```

Binary collation → no match. Locale-based collation → unpredictable.

------------------------------------------------------------------------

### 6) Logging as Code Points

``` python
with open('auth.log', 'a', encoding='utf-8') as f:
    email = 'g\uFF4Dail.com'
    f.write(f"raw:{email}\n")
    f.write(f"codepoints:{' '.join([hex(ord(c)) for c in email])}\n")
```

------------------------------------------------------------------------

### 7) Local-Only SMTP Debugging (Safe)

``` bash
python -m smtpd -n -c DebuggingServer localhost:1025
```

Then client:

``` python
import smtplib
from email.message import EmailMessage

msg = EmailMessage()
msg['Subject'] = 'Test'
msg['From'] = 'tester@example.local'
msg['To'] = 'victim@g\uff4dail.com'
msg.set_content('reset-link: https://example.local/reset?token=TEST')

with smtplib.SMTP('localhost', 1025) as s:
    s.send_message(msg)
```

This only prints locally, no real email routing.

------------------------------------------------------------------------

### 8) Unit Test Example

``` python
import unittest, unicodedata

class TestEmails(unittest.TestCase):
    def test_plain_vs_confusable(self):
        a = 'victim@gmail.com'
        b = 'victim@g\uff4dail.com'
        self.assertNotEqual(a, b)
        self.assertNotEqual(unicodedata.normalize('NFC', a),
                            unicodedata.normalize('NFC', b))

if __name__ == '__main__':
    unittest.main()
```

------------------------------------------------------------------------

## Conceptual Attack Flow (No Operational Detail)

1.  App uses email-based authentication.
2.  Attacker registers visually confusable email.
3.  If app compares without normalization, ambiguity occurs.
4.  Vulnerability emerges depending on normalization, DB collation,
    regex, etc.

------------------------------------------------------------------------

## Conclusion

This document showed, in a deeply technical manner, how **Punycode/IDN
and Unicode confusables** can undermine email-based authentication when
normalization and canonicalization are neglected. All demonstrations are
**local-only, research-safe**, and focus purely on string processing
behavior.




<div class="share-buttons">
  <p>Share this post:</p>
  <a class="share-btn twitter" href="https://twitter.com/intent/tweet?text=CVE-2025-29927: Next.js Middleware Authorization Bypass&url={{ page.url | absolute_url }}" target="_blank">Twitter</a>
  <a class="share-btn facebook" href="https://www.facebook.com/sharer/sharer.php?u={{ page.url | absolute_url }}" target="_blank">Facebook</a>
  <a class="share-btn reddit" href="https://www.reddit.com/submit?url={{ page.url | absolute_url }}&title=CVE-2025-29927: Next.js Middleware Authorization Bypass" target="_blank">Reddit</a>
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

<iframe width="100%" height="500" 
src="https://www.youtube.com/watch?v=_BkM5llJ_bo" 
title="0-Click Account Takeover Using Punycode Emails for Access" 
frameborder="0" 
allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
allowfullscreen></iframe>


