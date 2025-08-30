---
layout: default
title: "About NullSecurityX"
permalink: /about/
---

<!-- HEADER / NAVIGATION -->
<header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
  <div>
    <a href="{{ "/" | relative_url }}" style="text-decoration: none; color: #00ff99; font-weight: bold; font-size: 1.2rem;">Home</a>
    <a href="{{ "/about/" | relative_url }}" style="text-decoration: none; color: #00ff99; margin-left: 1rem;">About</a>
  </div>
</header>

<!-- TERMINAL STYLE CONTENT -->
<div id="terminal" style="background-color:#000; color:#00ff99; padding:2rem; border-radius:12px; max-width:800px; margin:auto; font-family: 'Courier New', monospace; white-space: pre-wrap; overflow-wrap: break-word; min-height:400px; position: relative;">

<span id="cursor" style="display:inline-block;">_</span>
</div>

<script>
const terminal = document.getElementById('terminal');
const cursor = document.getElementById('cursor');

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
    const char = text.charAt(index);
    terminal.insertBefore(document.createTextNode(char === '\n' ? '\n' : char), cursor);
    index++;
    setTimeout(type, 30);
  }
}

type();

// Cursor blink
setInterval(() => {
  cursor.style.visibility = (cursor.style.visibility === 'visible') ? 'hidden' : 'visible';
}, 500);
</script>

<style>
/* Hover efekti için linkleri neon yapıyoruz */
#terminal a {
  color: #00ff99;
  text-decoration: underline;
}
#terminal a:hover {
  color: #0ff;
}
</style>
