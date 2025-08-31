---
layout: default
title: "NullSecurityX Hacking Articles Blog"
---

<!-- HEADER / NAVIGATION -->
<header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
  <div>
    <a href="{{ "/" | relative_url }}" style="text-decoration: none; color: #f0f0f0; font-weight: bold; font-size: 1.2rem;">Home</a>
    <a href="{{ "/about" | relative_url }}" style="text-decoration: none; color: #f0f0f0; margin-left: 1rem;">About</a>
  </div>
</header>


<hr>

<div id="postsList" style="display: flex; flex-direction: column; gap: 1rem;">

{% for post in site.posts %}
<div class="post-card" style="background-color: #1a1a1a; padding: 1rem; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.5); display: flex; gap: 1rem; align-items: flex-start;">
  
  {% if post.image %}
  <div style="flex-shrink: 0;">
    <img src="{{ post.image }}" alt="{{ post.title }}" style="width: 150px; height: 100px; object-fit: cover; border-radius: 8px;">
  </div>
  {% endif %}
  
  <div style="flex: 1;">
    <h3 style="margin: 0 0 0.3rem 0; color: #f0f0f0;">{{ post.title }}</h3>
    <p style="font-size: 0.8rem; color: #bbbbbb; margin: 0 0 0.5rem 0;">{{ post.date | date: "%d %B %Y" }}</p>
    {% if post.excerpt %}
    <p style="font-size: 0.85rem; color: #cccccc; margin: 0;">{{ post.excerpt | strip_html | truncate: 150 }}</p>
    {% endif %}
    <a href="{{ post.url | relative_url }}" style="margin-top: 0.5rem; display: inline-block; padding: 0.5rem 1rem; background-color: #88c0d0; color: #1a1a1a; border-radius: 6px; text-decoration: none; font-weight: bold;">Read More</a>
  </div>

</div>
{% endfor %}

</div>
<p align="center">
  <a href="https://www.youtube.com/@nullsecurityx" target="_blank">
    <img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" />
  </a>
  <a href="https://twitter.com/NullSecurityX" target="_blank">
    <img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" />
  </a>
  <a href="https://odysee.com/@NullSecurityX:0" target="_blank">
    <img src="https://img.shields.io/badge/Odysee-ED1C24?style=for-the-badge&logo=odysee&logoColor=white" />
  </a>
  <a href="https://www.linkedin.com/company/nullsecx/" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" />
  </a>
  <a href="https://buymeacoffee.com/nullsecx" target="_blank">
    <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" />
  </a>
</p>
<!-- Visitor Badge -->
<div style="margin-top: 1rem; text-align: center;">
  <img src="https://visitor-badge.laobi.icu/badge?page_id=NullSecurityX.nullsecurityx.github.io" alt="Visitor Count"/>
</div>
<style>
  .post-card:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0,0,0,0.6);
  }

  @media (max-width: 768px) {
    header {
      flex-direction: column;
      gap: 1rem;
    }
    .post-card {
      flex-direction: column;
      align-items: flex-start;
    }
    .post-card img {
      width: 100%;
      height: auto;
      margin-bottom: 0.5rem;
    }
    .post-card a {
      margin-left: 0;
    }
  }
</style>

