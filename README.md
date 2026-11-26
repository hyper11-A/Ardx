# Ardx Photo Editor

Aplikasi edit foto berbasis HTML, CSS, dan JavaScript murni. Bisa dijalankan secara lokal tanpa instalasi backend.

## Fitur
- Upload foto JPG, PNG, dan WEBP (maksimal 20 MB)
- Preview langsung di canvas
- Pengaturan kecerahan, kontras, saturasi, temperatur, dan blur
- Filter Original, Vintage, Monochrome, Golden, Cool, dan Soft Fade
- Putar kiri/kanan serta flip horizontal/vertikal
- Tambah teks, pilih warna, ukuran, dan posisi
- Hapus latar berwarna seragam secara otomatis tanpa pengaturan toleransi
- Zoom preview
- Unduh hasil sebagai PNG
- Desain responsif untuk desktop dan HP
- Animasi masuk, transisi panel, hover, dan notifikasi
- Foto diproses lokal di browser; tidak dikirim ke server

## Cara menjalankan
1. Ekstrak ZIP.
2. Buka folder `photo-editor-online`.
3. Klik dua kali `index.html` atau buka melalui browser.
4. Tekan **Pilih foto**, lakukan pengeditan, lalu tekan **Unduh hasil foto**.

Disarankan menggunakan Chrome, Edge, Firefox, atau Safari versi terbaru.

## Struktur folder
```text
photo-editor-online/
├── index.html
├── style.css
├── app.js
├── README.md
└── assets/
```

## Catatan
- Font Manrope dan DM Sans dimuat dari Google Fonts. Jika offline, browser menggunakan font cadangan.
- Fitur ini merupakan editor berbasis canvas, bukan pengganti penuh aplikasi profesional. Tidak tersedia layer kompleks, penghapus objek berbasis AI, atau penyimpanan cloud.
- Untuk memproses foto besar, kinerja bergantung pada kemampuan perangkat dan memori browser.
