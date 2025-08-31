<header class="flex justify-between items-center mb-4 px-6 py-4">
  <div class="flex items-center space-x-4">
    <img src="/assets/images/logo.png" alt="Logo" class="h-10 w-10 rounded-full">
    <span class="text-2xl font-bold">NullSecurityX</span>
  </div>
  <nav class="space-x-6">
    <a href="{{ '/' | relative_url }}" class="hover:text-green-400 transition">Home</a>
    <a href="{{ '/about' | relative_url }}" class="hover:text-green-400 transition">About</a>
    <a href="{{ '/youtube' | relative_url }}" class="hover:text-green-400 transition">YouTube</a>
  </nav>
</header>

<main class="px-6">
  <h1 class="text-3xl font-bold text-center mb-6">🎥 NullSecurityX YouTube Channel</h1>

  <div class="flex justify-center mb-12">
    <iframe class="rounded-xl shadow-xl" width="900" height="500"
      src="https://www.youtube.com/embed/P4Xf0SHqqqo"
      title="Latest NullSecurityX Video"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen>
    </iframe>
  </div>

  <h2 class="text-2xl font-semibold text-center mb-6">Latest Uploads</h2>

  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    
    <!-- Video Cards -->
    <script>
      const videos = [
        {id:"P4Xf0SHqqqo", title:"How Hackers Secretly Inject JS into Any PDF", desc:"Explore JS injection techniques in PDFs hackers use to bypass restrictions."},
        {id:"CejJWjyokFA", title:"The Hidden Danger in Chat Apps: Advanced XSS Exploitation", desc:"Learn advanced XSS exploitation methods in chat applications."},
        {id:"JaLaC0vSrcw", title:"How Hackers Can Change Product Prices Parameter Tampering", desc:"Parameter tampering explained with real examples."},
        {id:"Sf7LK8PnNf8", title:"Burp Suite for Professional Hackers", desc:"Master Burp Suite for web pentesting and hacking."},
        {id:"BVw994iIQtU", title:"Bypassing Filters with SQL Injection", desc:"Learn how to bypass filters using SQL injection techniques."},
        {id:"qtYev9inS7o", title:"Hacking JIRA: SSRF Exploitation & XSS Chaining", desc:"SSRF and XSS chaining exploitation explained."},
        {id:"Wd5lxLxTsf4", title:"Broken Access Control Deep Dive", desc:"Deep dive into broken access control vulnerabilities."},
        {id:"FmmwLpXz8cE", title:"We Tried to Hack a Chatbot LLM API with Command Injection", desc:"Command injection attempts on LLM APIs."},
        {id:"S3CVytIv098", title:"Next.js Middleware Bypass Vulnerability Explained", desc:"Middleware bypass explained in Next.js apps."},
        {id:"_C_VNc5of9w", title:"How to Get Started in CyberSecurity?", desc:"Beginner friendly guide to start in cybersecurity."},
        {id:"jdwZ09E-lsY", title:"We Broke Into a Server Using Just XML", desc:"Server compromise using XML tricks."},
        {id:"ZsWR5nqxdzI", title:"From SQLi to Admin: How We Broke a Bank App in Minutes", desc:"Full exploit walkthrough from SQLi to admin access."}
      ];

      const grid = document.currentScript.parentNode;
      videos.forEach(v=>{
        const card = document.createElement("div");
        card.className = "video-card relative rounded-xl overflow-hidden shadow-lg group";
        card.innerHTML = `
          <a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" class="block">
            <div class="relative">
              <img class="w-full h-48 object-cover group-hover:scale-105 transition-transform" src="https://img.youtube.com/vi/${v.id}/0.jpg" alt="Thumbnail">
              <div class="absolute inset-0 flex justify-center items-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition">
                <svg class="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 84 84">
                  <polygon points="33,22 33,62 66,42" />
                </svg>
              </div>
            </div>
            <div class="p-4">
              <h3 class="font-semibold group-hover:text-green-500 transition">${v.title}</h3>
              <p class="text-gray-600 text-sm mt-1">${v.desc}</p>
            </div>
          </a>
        `;
        grid.appendChild(card);
      });
    </script>

  </div>
</main>
