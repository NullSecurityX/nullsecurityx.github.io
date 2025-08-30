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
<div class="post-card" style="background-color: #1a1a1a; padding: 1rem; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.5); display: flex; justify-content: space-between; align-items: start;">
  <div>
    <h3 style="margin: 0 0 0.3rem 0; color: #f0f0f0;">{{ post.title }}</h3>
    <p style="font-size: 0.8rem; color: #bbbbbb; margin: 0 0 0.5rem 0;">{{ post.date | date: "%d %B %Y" }}</p>
    {% if post.excerpt %}
    <p style="font-size: 0.85rem; color: #cccccc; margin: 0;">{{ post.excerpt | strip_html | truncate: 150 }}</p>
    {% endif %}
  </div>
  <a href="{{ post.url | relative_url }}" style="margin-left: 1rem; padding: 0.5rem 1rem; background-color: #88c0d0; color: #1a1a1a; border-radius: 6px; text-decoration: none; font-weight: bold;">Read More</a>
</div>
{% endfor %}

</div>

<!-- SOCIAL MEDIA ICONS -->
<div style="display: flex; gap: 1rem; margin-top: 2rem; justify-content: center;">
  <a href="https://twitter.com/NullSecurityX" target="_blank" style="color: #1DA1F2; font-size: 1.5rem;">
    <i class="fab fa-twitter"></i>
  </a>
  <a href="https://www.youtube.com/@nullsecurityx" target="_blank" style="color: #FF0000; font-size: 1.5rem;">
    <i class="fab fa-youtube"></i>
  </a>
  <a href="https://odysee.com/@nullsecurityx" target="_blank" style="color: #FF7F00; font-size: 1.5rem;">
    <i class="fas fa-globe"></i>
  </a>
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
    .post-card a {
      margin-top: 0.5rem;
      margin-left: 0;
    }
  }
</style>
