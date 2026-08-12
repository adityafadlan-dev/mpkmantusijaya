document.addEventListener("DOMContentLoaded", () => {
  setupTabNavigation();
  setupFormSubmit();
  if (window.lucide) { lucide.createIcons(); }
});

function setupTabNavigation() {
  const btnTabForm = document.getElementById("btn-tab-form");
  const btnTabMading = document.getElementById("btn-tab-mading");
  const sectionForm = document.getElementById("section-form");
  const sectionMading = document.getElementById("section-mading");

  btnTabForm.addEventListener("click", () => {
    btnTabForm.className = "flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm bg-maroon-700 text-white shadow-lg shadow-maroon-700/25 transition-all duration-300 scale-[1.02]";
    btnTabMading.className = "flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm bg-white/70 text-gray-600 border border-gray-200/80 hover:bg-white hover:text-maroon-700 transition-all duration-300";
    sectionForm.classList.remove("hidden");
    sectionMading.classList.add("hidden");
  });

  // Pas tab mading diklik, dia manggil renderMading secara asinkron
  btnTabMading.addEventListener("click", () => {
    btnTabMading.className = "flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm bg-maroon-700 text-white shadow-lg shadow-maroon-700/25 transition-all duration-300 scale-[1.02]";
    btnTabForm.className = "flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm bg-white/70 text-gray-600 border border-gray-200/80 hover:bg-white hover:text-maroon-700 transition-all duration-300";
    sectionForm.classList.add("hidden");
    sectionMading.classList.remove("hidden");
    renderMading();
  });
}

function setupFormSubmit() {
  const form = document.getElementById("form-aspirasi");
  const btnSubmit = document.getElementById("btn-submit-aspirasi");
  const alertSuccess = document.getElementById("alert-success");

  // Tambahin async di sini
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const namaInput = document.getElementById("input-nama").value.trim();
    const kelasInput = document.getElementById("input-kelas").value;
    const kategoriInput = document.getElementById("input-kategori").value;
    const aspirasiInput = document.getElementById("input-aspirasi").value.trim();
    const anonimCheck = document.getElementById("input-anonim").checked;

    if (!namaInput || !aspirasiInput) return alert("Mohon lengkapi form.");

    // Ganti tombol jadi loading
    btnSubmit.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Sedang Mengirim...`;
    btnSubmit.disabled = true;

    const newAspirasi = {
      id: "ASP-" + Date.now(),
      timestamp: new Date().toLocaleString("id-ID"),
      nama: namaInput,
      kelas: kelasInput,
      kategori: kategoriInput,
      aspirasi: aspirasiInput,
      anonim: anonimCheck,
      status: "Pending",
      tanggapan: ""
    };

    // Await untuk nunggu data beneran kesimpen di database Supabase
    await saveAspirasiData(newAspirasi);

    // Kembalikan tombol seperti semula
    btnSubmit.innerHTML = `<i data-lucide="send" class="w-4 h-4"></i> <span>Kirim Aspirasi Sekarang</span>`;
    btnSubmit.disabled = false;
    if (window.lucide) { lucide.createIcons(); }

    alertSuccess.classList.remove("hidden");
    form.reset();

    setTimeout(() => {
      alertSuccess.classList.add("hidden");
    }, 5000);
  });
}

// Bikin fungsi ini jadi async biar bisa nunggu data Supabase
async function renderMading() {
  const container = document.getElementById("mading-container");
  const emptyState = document.getElementById("mading-empty");
  const loadingState = document.getElementById("mading-loading");

  container.innerHTML = "";
  emptyState.classList.add("hidden");
  loadingState.classList.remove("hidden"); // Munculin loading

  // Nunggu data dari server Supabase
  const allData = await getAspirasiData();
  
  loadingState.classList.add("hidden"); // Hilangin loading

  const publicData = allData.filter(item => item.status === "Approved" || item.status === "Selesai");

  if (publicData.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  publicData.forEach(item => {
    const isSelesai = item.status === "Selesai";
    const statusBadge = isSelesai 
      ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-800"><i data-lucide="check-circle-2" class="w-3.5 h-3.5 mr-1"></i> Selesai</span>`
      : `<span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-lg bg-blue-100 text-blue-800"><i data-lucide="shield-check" class="w-3.5 h-3.5 mr-1"></i> Disetujui</span>`;

    const namaTampilan = item.anonim ? "Siswa (Mode Privasi)" : item.nama;
    const anonimIcon = item.anonim 
      ? `<span class="inline-flex items-center px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold text-[10px]"><i data-lucide="lock" class="w-3 h-3 mr-0.5"></i> Privasi</span>` 
      : "";

    const card = document.createElement("div");
    card.className = "glass-card glass-card-hover p-6 rounded-3xl flex flex-col justify-between";
    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start gap-2 mb-3">
          <span class="text-xs font-bold text-maroon-700">${item.kategori}</span>
          ${statusBadge}
        </div>
        <p class="text-gray-800 text-sm leading-relaxed mb-6 font-medium">"${item.aspirasi}"</p>
      </div>
      <div class="pt-4 border-t border-gray-200">
        <div class="flex justify-between items-center text-xs text-gray-500 mb-3">
          <div class="font-semibold text-gray-700 flex items-center gap-1">
            <i data-lucide="user" class="w-3.5 h-3.5"></i> ${namaTampilan} (${item.kelas}) ${anonimIcon}
          </div>
          <span>${item.timestamp.split(' ')[0]}</span>
        </div>
        ${
          item.tanggapan 
            ? `<div class="bg-maroon-50 p-3 rounded-xl border border-maroon-100 text-xs"><strong class="text-maroon-800">Tanggapan MPK:</strong> <span class="text-gray-700">${item.tanggapan}</span></div>` 
            : `<div class="text-xs italic text-gray-400"><i data-lucide="hourglass" class="w-3 h-3 inline"></i> Menunggu tanggapan...</div>`
        }
      </div>
    `;
    container.appendChild(card);
  });
  if (window.lucide) { lucide.createIcons(); }
}