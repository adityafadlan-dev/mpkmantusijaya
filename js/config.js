// js/config.js

const SUPABASE_URL = "https://shqttccbagjduzjeknyy.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_DxPrN8GEA0TpVo-dpeCmeQ_lOT8QZAN";

// NAMA VARIABEL KITA UBAH JADI supabaseClient BIAR GAK BENTROK
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const CONFIG = {
  ADMIN_PASSWORD: "mpkman1jayaselalu" // Password login admin
};

// Fungsi get data 
async function getAspirasiData() {
  const { data, error } = await supabaseClient
    .from('aspirasi')
    .select('*')
    .order('timestamp', { ascending: false });
    
  if (error) {
    console.error("Gagal ambil data:", error);
    return [];
  }
  return data || [];
}

// Fungsi simpan data baru
async function saveAspirasiData(newData) {
  const { error } = await supabaseClient
    .from('aspirasi')
    .insert([newData]);
    
  if (error) {
      console.error("Gagal simpan data:", error);
      alert("Gagal menyimpan data ke database. Cek koneksi.");
  }
}

// Fungsi serbaguna untuk update data
async function updateAspirasi(id, updates) {
  const { error } = await supabaseClient
    .from('aspirasi')
    .update(updates)
    .eq('id', id);
    
  if (error) console.error("Gagal update data:", error);
}

// Fungsi hapus data
async function deleteAspirasiData(id) {
  const { error } = await supabaseClient
    .from('aspirasi')
    .delete()
    .eq('id', id);
    
  if (error) console.error("Gagal hapus data:", error);
}
