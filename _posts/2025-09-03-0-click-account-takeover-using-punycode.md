---
title: "0-Click Account Takeover Using Punycode Emails for Access"
layout: post
tags: [Punycode, IDN, Unicode, email-security, account-takeover, phishing, parsing, exploit, hacking, cybersecurity]
image: assets/images/punycode.png
---


# 0-Click Account Takeover Using Punycode Emails for Access --- Technical Analysis (With Explanations)

> **IMPORTANT ETHICAL NOTE:** This document is **not intended** to
> provide step-by-step exploit guidance for unauthorized access. All
> code samples are for research and demonstration purposes only.

------------------------------------------------------------------------

## Abstract

This paper analyzes how **Punycode / IDN** encoding of email domains and
Unicode confusable characters can introduce ambiguity into email-based
authentication flows. We show Unicode normalization, parsing pitfalls,
regex issues, database collation effects, and provide annotated code
demonstrations.

------------------------------------------------------------------------

## Code Demonstrations (with Explanations)

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

**Explanation:**\
- `idna.encode` converts the Unicode domain (`gｍail.com`) into
ASCII-compatible Punycode (ACE).\
- `idna.decode` reverses the process back to Unicode.\
- The `codepoints` function prints each character's Unicode code point.\
- The comparison shows that `gmail.com` and `gｍail.com` look the same,
but are not equal at the binary or normalized string level.

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

**Explanation:**\
- Uses Node.js `punycode` module to encode/decode Unicode domains.\
- Shows how the string `gｍail.com` maps to ACE format (`xn--...`).\
- The `codePoints` function highlights invisible or confusable
characters.

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

**Explanation:**\
- Go's `idna` library performs the same conversion.\
- This confirms cross-language consistency: all environments must
normalize domains consistently, otherwise mismatches arise.

------------------------------------------------------------------------

### 4) Regex Pitfalls

``` regex
^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$
```

**Explanation:**\
- This regex assumes only ASCII letters.\
- Unicode confusables (`＠`, `ｍ`, etc.) bypass such validation, leading
to email validation bugs.

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

**Explanation:**\
- Both the legitimate email and the Punycode version may incorrectly
pass validation.\
- Applications relying on regex-only validation become vulnerable.

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

**Explanation:**\
- Depending on collation rules, databases may incorrectly treat
confusables as equal or distinct.\
- This can lead to duplicate accounts, broken authentication, or
privilege escalation.

------------------------------------------------------------------------

### 6) Logging as Code Points

``` python
with open('auth.log', 'a', encoding='utf-8') as f:
    email = 'g\uFF4Dail.com'
    f.write(f"raw:{email}\n")
    f.write(f"codepoints:{' '.join([hex(ord(c)) for c in email])}\n")
```

**Explanation:**\
- Logs both the raw string and code points.\
- This makes confusable characters visible for forensic analysis.

------------------------------------------------------------------------

### 7) Local-Only SMTP Debugging (Safe)

``` bash
python -m smtpd -n -c DebuggingServer localhost:1025
```

**Explanation:**\
- Starts a local SMTP debug server that prints emails to stdout (no real
delivery).

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

**Explanation:**\
- Sends an email to the debug server.\
- Safe way to simulate application behavior without external traffic.

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

**Explanation:**\
- Verifies that visually identical emails are **not equal** at string or
normalized level.\
- Ensures test coverage for Unicode confusables.

------------------------------------------------------------------------

## Conclusion

Each code snippet demonstrates a different weak point in handling
Unicode/Punycode in email flows. Explanations clarify why these
mismatches matter and how inconsistencies arise.


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
<h2 id="-video-demonstration">📺 Video Demonstration</h2>

<iframe width="100%" height="500" src="https://www.youtube.com/embed/_BkM5llJ_bo" title="0-Click Account Takeover Using Punycode Emails for Access" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>



