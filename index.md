---
layout: default
title: "NullSecurityX Hacking Articles Blog"
---

<div style="display: flex; gap: 2rem;">

  <!-- POSTS LIST -->
  <div id="postsList" style="flex: 2; display: flex; flex-direction: column; gap: 1rem;">

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

  <!-- YOUTUBE SIDEBAR -->
  <aside style="flex: 1; display: flex; flex-direction: column; gap: 1rem;">
    <h3 style="color: #f0f0f0;">Latest Videos</h3>
    
    <iframe width="100%" height="250" src="https://www.youtube.com/embed/CejJWjyokFA" title="YouTube video" frameborder="0" allowfullscreen></iframe>
    <iframe width="100%" height="250" src="https://www.youtube.com/embed/P4Xf0SHqqqo" title="YouTube video" frameborder="0" allowfullscreen></iframe>
    <iframe width="100%" height="250" src="https://www.youtube.com/embed/Sf7LK8PnNf8" title="YouTube video" frameborder="0" allowfullscreen></iframe>
  </aside>

</div>

<style>
  .post-card:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0,0,0,0.6);
  }

  @media (max-width: 1024px) {
    div[style*="display: flex; gap: 2rem;"] {
      flex-direction: column;
    }
  }

  @media (max-width: 768px) {
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
