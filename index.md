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

  <form id="searchForm" style="display: flex; gap: 0.5rem;">
    <input type="text" id="searchInput" placeholder="Search posts..." style="padding: 0.5rem; border-radius: 6px; border: none;">
    <select id="categorySelect" style="padding: 0.5rem; border-radius: 6px; border: none;">
      <option value="">All Categories</option>
      {% assign all_tags = site.posts | map: "tags" | join: "," | split: "," | uniq | sort %}
      {% for tag in all_tags %}
        {% if tag != "" %}
        <option value="{{ tag }}">{{ tag }}</option>
        {% endif %}
      {% endfor %}
    </select>
  </form>
</header>

## 🌟 Featured Post

{% assign featured = site.posts.first %}
<div class="featured-post" style="background-color: #1a1a1a; padding: 1.5rem; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.6); margin-bottom: 2rem; transition: transform 0.2s, box-shadow 0.2s;">
  <a href="{{ featured.url | relative_url }}" style="text-decoration: none; color: #f0f0f0;">
    <h2>{{ featured.title }}</h2>
    <p style="font-size: 0.85rem; color: #bbbbbb;">{{ featured.date | date: "%d %B %Y" }}</p>
    {% if featured.excerpt %}
    <p style="font-size: 0.9rem; color: #cccccc;">{{ featured.excerpt | strip_html | truncate: 200 }}</p>
    {% endif %}
    {% if featured.tags %}
    <p style="font-size: 0.8rem; color: #88c0d0; margin-top: 0.5rem;">
      {% for tag in featured.tags %}
      <span>#{{ tag }}</span>{% unless forloop.last %}, {% endunless %}
      {% endfor %}
    </p>
    {% endif %}
  </a>
</div>

---

{% endfor %}

</div>

<style>
  .featured-post:hover,
  .post-card:hover {
    transform: scale(1.03);
    box-shadow: 0 6px 18px rgba(0,0,0,0.8);
  }

  @media (max-width: 768px) {
    header {
      flex-direction: column;
      gap: 1rem;
    }
    #searchForm {
      width: 100%;
      justify-content: flex-start;
    }
  }
</style>

<script>
  const searchInput = document.getElementById('searchInput');
  const categorySelect = document.getElementById('categorySelect');
  const postsGrid = document.getElementById('postsGrid');
  const posts = Array.from(postsGrid.children);

  function filterPosts() {
    const searchText = searchInput.value.toLowerCase();
    const category = categorySelect.value.toLowerCase();

    posts.forEach(post => {
      const title = post.querySelector('h3').innerText.toLowerCase();
      const tags = post.querySelector('a').dataset.tags.toLowerCase();
      const matchesSearch = title.includes(searchText);
      const matchesCategory = !category || tags.includes(category);

      post.style.display = (matchesSearch && matchesCategory) ? 'block' : 'none';
    });
  }

  searchInput.addEventListener('input', filterPosts);
  categorySelect.addEventListener('change', filterPosts);
</script>

---

## 🔗 Social Media

<div style="display: flex; gap: 1rem; margin-top: 1rem;"><br>
- 🐦 [Twitter](https://twitter.com/NullSecurityX)  
<br>- ▶️ [YouTube](https://www.youtube.com/@nullsecurityx)  
<br>- 🌐 [Odysee](https://odysee.com/@nullsecurityx)  
</div>

---

> “Knowledge shared is power multiplied.”
