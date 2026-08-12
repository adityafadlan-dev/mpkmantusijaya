// GANTI DUA BARIS INI DENGAN DATA DARI SUPABASE PROJECT LU
const SUPABASE_URL = "https://shqttccbagjduzjeknyy.supabase.co"; // Ganti URL lu
const SUPABASE_KEY = "sb_publishable_DxPrN8GEA0TpVo-dpeCmeQ_lOT8QZAN"; // Ganti Anon Key lu

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const CONFIG = {
  ADMIN_PASSWORD: "mpkman1jayaselalu" // Password login admin
};

// Fungsi get data (UDAH DIBUAT ASYNC)
async function getAspirasiData() {
  const { data, error } = await supabase
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
  const { error } = await supabase
    .from('aspirasi')
    .insert([newData]);
    
  if (error) console.error("Gagal simpan data:", error);
}

// Fungsi serbaguna untuk update data
async function updateAspirasi(id, updates) {
  const { error } = await supabase
    .from('aspirasi')
    .update(updates)
    .eq('id', id);
    
  if (error) console.error("Gagal update data:", error);
}

// Fungsi hapus data
async function deleteAspirasiData(id) {
  const { error } = await supabase
    .from('aspirasi')
    .delete()
    .eq('id', id);
    
  if (error) console.error("Gagal hapus data:", error);
}