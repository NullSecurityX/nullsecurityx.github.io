---
title: "0-Click Account Takeover Using Punycode Emails for Access"
layout: post
tags: [Punycode, IDN, Unicode, email-security, account-takeover, phishing, parsing, exploit, hacking, cybersecurity]
image: assets/images/punycode.png
---


# 0-Click Account Takeover Using Punycode Emails for Access --- Technical Analysis (Expanded Intro + Explanations)

> **IMPORTANT ETHICAL NOTE:** This document is **not intended** to
> provide step-by-step exploit guidance for unauthorized access. All
> code samples are for research and demonstration purposes only
> (local/lab-safe).

------------------------------------------------------------------------

## Executive Summary (Expanded)

Email remains the trust anchor for most account recovery and
"passwordless" sign‑in schemes (password reset links, magic links,
one‑time URLs). A single assumption underpins these flows: *the party
receiving the message is the intended mailbox owner.* When
**Internationalized Domain Names (IDN)** and **Unicode confusables**
enter the pipeline, that assumption can silently fail **without any
victim interaction** --- yielding a *0‑click account takeover* risk.

This paper dissects the string-processing layer where the risk
originates. The mechanism is not social engineering; it is a
**canonicalization mismatch** across components that handle email
addresses differently:

-   **Applications** often compare/display user emails in **Unicode**
    for UX, but store or route using **ASCII/Punycode (ACE)**.
-   **Libraries** and **frameworks** auto-convert IDN between Unicode
    and ACE at different boundaries (UI, validation, DB, mailer).
-   **Databases** may apply **collations** that consider visually
    similar text "equal" or, conversely, treat canonically-equal text as
    distinct.
-   **Regex**-only validators and naive normalizers create acceptance
    gaps for Unicode code points that are *render-equivalent* but
    *code‑point‑distinct*.

The result: two addresses that *look the same* to humans (and sometimes
to logs or UI) can be handled as different strings by the mail
transport, or vice versa. If an application relies on brittle
comparisons at any point in the recovery or magic-link pipeline, a
malicious but "confusable" address may end up receiving privileged links
**with zero user action required by the victim**.

------------------------------------------------------------------------

## What "0‑Click" Means in Email Auth

"0‑click" here means the compromise does **not** require the target user
to click, approve, or interact. The attacker leverages how the
**application** and its **infrastructure** *emit* and *deliver*
privileged links when presented with a visually confusable but distinct
address.

Two common flows:

1)  **Password Reset Flow**

```{=html}
<!-- -->
```
    User (claims email)  →  App backend  →  Token issuance  →  Mailer/MTA  →  Recipient domain  →  Mailbox
                              │
                              └─ Address canonicalization & equality checks happen here

2)  **Magic Link (Passwordless) Flow**

```{=html}
<!-- -->
```
    Claimed email  →  Identity/Session service  →  Signed login URL  →  Email delivery  →  Mailbox → Auth
                         │
                         └─ Any mismatch here can route the link to an unintended but confusable address

Crucially, **no user interaction** by the legitimate owner is necessary
if the pipeline itself misroutes or mis-validates based on Unicode/IDN
ambiguity.

------------------------------------------------------------------------

## Where Ambiguity Enters: A Layer-by-Layer View

**A. UI & Input Parsing**\
- Browsers and input widgets accept Unicode. Users type or paste
addresses that *render* like popular domains. - Some frameworks
auto-display IDN in Unicode for readability, masking ACE (`xn--`) form.

**B. Validation & Normalization**\
- Regex written for ASCII misses Unicode confusables (e.g., FULLWIDTH
forms, Cyrillic lookalikes, Greek omicron). - Inconsistent use of
**NFC/NFD/NFKC/NFKD** means two visually identical strings may not
compare equal.

**C. Storage & Lookup (DB)**\
- Application might store the **display** (Unicode) form or the **wire**
(ACE) form inconsistently. - Collation/locale rules can deem strings
equal/unequal in surprising ways, impacting uniqueness constraints and
lookups.

**D. Mail Emission & Transport**\
- SMTP envelope addresses and **To:** headers can diverge depending on
library defaults. - MTAs/MUAs vary in how they render or downgrade IDN;
logs might hide the confusable points, confusing incident response.

**E. Logging/Alerting**\
- If logs store only rendered Unicode without code points, responders
won't see the difference between `gmail.com` and `gｍail.com` (U+FF4D).

------------------------------------------------------------------------

## End-to-End Example (Conceptual, Non‑Operational)

-   Legitimate account: `victim@gmail.com` (all ASCII Latin).\
-   Confusable lookalike: `victim@gｍail.com` where `ｍ` is **U+FF4D**
    FULLWIDTH LATIN SMALL LETTER M.\
-   If the app compares the **displayed Unicode** value against stored
    **Unicode** without canonical rules that map confusables, it may
    treat them as "same enough" at one boundary yet **route** mail to
    the **attacker‑controlled domain** elsewhere (where ACE actually
    differs).\
-   The attacker then receives the reset/magic link even though the
    victim never touched anything --- a **0‑click** condition created by
    **canonicalization drift**.

> We do **not** include operational steps (domain registration, MX
> setup, routing). This analysis stays at string-processing and
> validation behavior.

------------------------------------------------------------------------

## Quick Primer: IDN / Punycode / Unicode Confusables

-   **IDN** allows non‑ASCII domain labels by transforming Unicode to
    ASCII **ACE** form using **Punycode**; ACE labels start with `xn--`.
-   **Punycode** is a reversible mapping; libraries exist across
    languages (Python `idna`, Node `punycode`, Go `x/net/idna`).\
-   **Confusables** are distinct code points that **render similarly**
    (e.g., Latin `m` vs FULLWIDTH `ｍ` U+FF4D; Latin `o` vs Cyrillic `о`
    U+043E).

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

The "0‑click" risk is a byproduct of mixed Unicode/ACE handling across
UI, validation, storage, and mail emission layers. By examining
code‑point behavior and normalization boundaries (without any
operational exploit steps), this paper shows how brittle assumptions in
email-based auth can create implicit trust violations that an attacker
can abuse *without victim interaction*.



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

<iframe width="100%" height="500" src="https://www.youtube.com/embed/_BkM5llJ_bo" title="0-Click Account Takeover Using Punycode Emails for Access" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>



