document.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus();
  setupLoginModal();
  setupExportButton();
  if (window.lucide) { lucide.createIcons(); }
});

function checkLoginStatus() {
  const isLoggedIn = sessionStorage.getItem("MPK_ADMIN_LOGGED_IN");
  const loginModal = document.getElementById("login-modal");
  const adminContent = document.getElementById("admin-content");

  if (isLoggedIn === "true") {
    loginModal.classList.add("hidden");
    adminContent.classList.remove("hidden");
    refreshAdminDashboard();
  } else {
    loginModal.classList.remove("hidden");
    adminContent.classList.add("hidden");
  }
}

function setupLoginModal() {
  const btnLogin = document.getElementById("btn-login");
  const inputPass = document.getElementById("input-password");
  const btnLogout = document.getElementById("btn-logout");

  btnLogin.addEventListener("click", () => {
    if (inputPass.value === CONFIG.ADMIN_PASSWORD) {
      sessionStorage.setItem("MPK_ADMIN_LOGGED_IN", "true");
      checkLoginStatus();
    } else {
      document.getElementById("login-error").classList.remove("hidden");
    }
  });

  inputPass.addEventListener("keypress", (e) => { if (e.key === "Enter") btnLogin.click(); });
  btnLogout.addEventListener("click", () => { sessionStorage.removeItem("MPK_ADMIN_LOGGED_IN"); checkLoginStatus(); });
}

// Bikin async biar nunggu proses get data dan render selesai
async function refreshAdminDashboard() {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = `<tr><td colspan="5" class="text-center py-10 font-bold text-gray-500"><i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto mb-2 text-maroon-700"></i> Memuat Data Database...</td></tr>`;
  if (window.lucide) { lucide.createIcons(); }

  const allData = await getAspirasiData();
  renderKPI(allData);
  renderAdminTable(allData);
}

function renderKPI(allData) {
  document.getElementById("kpi-total").innerText = allData.length;
  document.getElementById("kpi-pending").innerText = allData.filter(i => i.status === "Pending").length;
  document.getElementById("kpi-approved").innerText = allData.filter(i => i.status === "Approved").length;
  document.getElementById("kpi-selesai").innerText = allData.filter(i => i.status === "Selesai").length;
}

function renderAdminTable(allData) {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";

  if (allData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-12 text-gray-400">Belum ada aspirasi yang masuk.</td></tr>`;
    return;
  }

  allData.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.className = "border-b border-gray-200/60 hover:bg-white transition-colors text-sm";
    
    const isAnonim = item.anonim ? `<span class="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded font-bold ml-2">ANONIM</span>` : '';
    
    tr.innerHTML = `
      <td class="p-4 text-center font-semibold text-gray-400">${index + 1}</td>
      <td class="p-4">
        <div class="font-bold text-gray-800">${item.nama} ${isAnonim}</div>
        <div class="text-xs text-gray-500">${item.kelas} • ${item.timestamp.split(' ')[0]}</div>
      </td>
      <td class="p-4 max-w-xs">
        <span class="text-[10px] font-bold text-maroon-700 bg-maroon-50 px-2 py-0.5 rounded">${item.kategori}</span>
        <p class="text-gray-700 text-xs mt-1.5 line-clamp-2" title="${item.aspirasi}">${item.aspirasi}</p>
      </td>
      <td class="p-4 w-72">
        <select onchange="changeStatus('${item.id}', this.value)" class="w-full text-xs font-semibold px-2 py-1.5 mb-2 rounded border focus:outline-none bg-white">
          <option value="Pending" ${item.status === 'Pending' ? 'selected' : ''}>Menunggu (Pending)</option>
          <option value="Approved" ${item.status === 'Approved' ? 'selected' : ''}>Disetujui (Ke Mading)</option>
          <option value="Selesai" ${item.status === 'Selesai' ? 'selected' : ''}>Selesai Ditangani</option>
          <option value="Reject" ${item.status === 'Reject' ? 'selected' : ''}>Ditolak (Hapus dari Mading)</option>
        </select>
        <div class="flex gap-2">
          <input type="text" id="tanggapan-${item.id}" value="${item.tanggapan || ''}" placeholder="Tulis tanggapan..." class="w-full text-xs px-2 py-1 border rounded bg-white">
          <button onclick="saveTanggapan('${item.id}')" class="bg-maroon-700 text-white px-2 rounded text-[10px] font-bold">SIMPAN</button>
        </div>
      </td>
      <td class="p-4 text-center">
        <button onclick="deleteAspirasi('${item.id}')" class="text-red-500 hover:text-red-700 p-2"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  if (window.lucide) { lucide.createIcons(); }
}

// Fungsi asinkron untuk update ke Supabase
window.changeStatus = async function(id, newStatus) {
  await updateAspirasi(id, { status: newStatus });
  refreshAdminDashboard();
};

window.saveTanggapan = async function(id) {
  const inputVal = document.getElementById(`tanggapan-${id}`).value.trim();
  await updateAspirasi(id, { tanggapan: inputVal });
  alert("Tanggapan berhasil disimpan!");
  refreshAdminDashboard();
};

window.deleteAspirasi = async function(id) {
  if (confirm("Yakin ingin menghapus data ini selamanya?")) {
    await deleteAspirasiData(id);
    refreshAdminDashboard();
  }
};

// Logika Export Excel juga nunggu data terbaru dulu
function setupExportButton() {
  const btnExport = document.getElementById("btn-export-excel");
  
  btnExport.addEventListener("click", async () => {
    btnExport.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Menyiapkan File...`;
    
    const allData = await getAspirasiData(); // Tunggu data turun dari server
    
    if (allData.length === 0) {
      alert("Tidak ada data untuk diunduh!");
      btnExport.innerHTML = `<i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Download Laporan Excel`;
      return;
    }

    const excelRows = allData.map((item, index) => ({
      "No": index + 1,
      "Waktu (WIB)": item.timestamp,
      "Nama (Di Publik)": item.anonim ? "Siswa Anonim" : item.nama,
      "Nama Asli": item.nama,
      "Kelas": item.kelas,
      "Kategori": item.kategori,
      "Isi Aspirasi": item.aspirasi,
      "Status": item.status,
      "Tanggapan MPK": item.tanggapan || "-",
      "Mode Anonim": item.anonim ? "Ya" : "Tidak"
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Aspirasi");
    
    XLSX.writeFile(workbook, `Rekap_Aspirasi_MPK_${new Date().toISOString().slice(0, 10)}.xlsx`);
    
    btnExport.innerHTML = `<i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Download Laporan Excel`;
    if (window.lucide) { lucide.createIcons(); }
  });
}