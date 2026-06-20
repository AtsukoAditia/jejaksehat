# Phase 6 Completion

Phase 6 melengkapi dashboard JejakSehat dengan dua insight utama.

## Workout streak

- Menggunakan tanggal aktivitas unik agar dua sesi pada hari yang sama tidak dihitung dua kali.
- Streak aktif tetap berjalan jika aktivitas terbaru terjadi hari ini atau kemarin.
- Jika aktivitas terakhir lebih lama dari kemarin, current streak menjadi nol.
- Longest streak tetap dihitung dari seluruh histori yang berhasil dibaca.
- Perhitungan tanggal hari ini menggunakan timezone Asia/Jakarta.

## Previous workout comparison

Perbandingan gym mencari sesi terdahulu yang:

- Dimiliki user terautentikasi yang sama.
- Bertipe gym.
- Memiliki judul sesi sama setelah normalisasi huruf kecil dan spasi.
- Terjadi sebelum sesi yang sedang dilihat.
- Paling dekat secara tanggal dan waktu pencatatan.

Metrik yang dibandingkan:

- Durasi.
- Total volume.
- Total set.
- Jumlah gerakan.
- Volume per gerakan yang sama.
- Beban terbaik per gerakan yang sama.

Jika belum ada sesi pembanding, UI menampilkan empty state dan tidak menghasilkan data buatan.
