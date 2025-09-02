// DOM öğelerini seç
const categorySelect = document.getElementById('category');
const runButton = document.getElementById('runPayload');
const resultsDiv = document.getElementById('results');

// Rastgele payload seçmek için fonksiyon
function getRandomPayload(category) {
  const list = payloads[category];
  if (!list || list.length === 0) return null;
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

// Payload çalıştırma fonksiyonu
function runPayload(category) {
  const payload = getRandomPayload(category);
  if (!payload) {
    resultsDiv.textContent = "Seçilen kategoride payload bulunamadı.";
    return;
  }

  try {
    // Farklı türler için payload'u çalıştır
    if (category === 'alert' || category === 'dom' || category === 'console' || category === 'html') {
      // Eval ile çalıştır
      eval(payload);
      resultsDiv.textContent = `Payload çalıştırıldı:\n${payload}`;
    } else {
      resultsDiv.textContent = "Bilinmeyen kategori.";
    }
  } catch (err) {
    resultsDiv.textContent = `Hata oluştu: ${err}\nPayload: ${payload}`;
  }
}

// Butona tıklanınca payload çalıştır
runButton.addEventListener('click', () => {
  const selectedCategory = categorySelect.value;
  runPayload(selectedCategory);
});
