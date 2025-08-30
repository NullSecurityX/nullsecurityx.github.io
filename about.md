---
layout: default
title: "About NullSecurityX"
permalink: /about/
---

<header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
  <div>
    <a href="{{ "/" | relative_url }}" style="text-decoration: none; color: #00ff99; font-weight: bold; font-size: 1.2rem;">Home</a>
    <a href="{{ "/about/" | relative_url }}" style="text-decoration: none; color: #00ff99; margin-left: 1rem;">About</a>
  </div>
</header>

<div id="terminal" style="background-color:#000; color:#00ff99; padding:2rem; border-radius:12px; max-width:800px; margin:auto; font-family: 'Courier New', monospace; white-space: pre-wrap; overflow-wrap: break-word; min-height:400px;">

</div>

<script>
const terminal = document.getElementById('terminal');
const text = `
Welcome to NullSecurityX! 👾
This blog shares hacking, cybersecurity, and technical articles.

What we focus on:
- Ethical hacking tutorials
- Security research
- Technical guides and insights

Connect with Us:
- YouTube: https://www.youtube.com/@nullsecurityx
- Twitter: https://twitter.com/NullSecurityX
- Odysee: https://odysee.com/@NullSecurityX:0
- LinkedIn: https://www.linkedin.com/company/nullsecx/
`;

let index = 0;
function type() {
  if(index < text.length) {
    terminal.innerHTML += text.charAt(index) === '\n' ? '<br>' : text.charAt(index);
    index++;
    setTimeout(type, 30); // yazma hızı
  } else {
    terminal.innerHTML += '<br>_'; // cursor
  }
}
type();
</script>
