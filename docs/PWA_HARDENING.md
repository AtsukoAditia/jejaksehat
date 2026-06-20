# PWA Hardening

## Install experience

JejakSehat menyediakan:

- Manifest standalone dengan icon PNG 192x192 dan 512x512.
- Maskable icon untuk launcher Android.
- Apple touch icon.
- Shortcut ke pencatatan aktivitas dan progress.
- Custom install prompt pada browser yang mendukung `beforeinstallprompt`.
- Petunjuk manual `Tambahkan ke Layar Utama` untuk Safari iOS.
- Penundaan prompt selama tujuh hari setelah pengguna memilih `Nanti`.

## Cache policy

Service worker hanya menyimpan:

- Landing page publik.
- Offline fallback.
- Manifest dan icon.
- Static framework assets seperti CSS, JavaScript, image, dan font.

Service worker tidak menangani atau menyimpan:

- Request `/api/*`.
- Response data aktivitas.
- Body measurements.
- Goals.
- Session atau response autentikasi.
- Halaman dashboard pribadi sebagai app shell.

Kebijakan ini sengaja lebih konservatif karena JejakSehat memproses data kesehatan personal.

## Offline behavior

Saat offline:

- Navigasi yang gagal diarahkan ke halaman `/offline`.
- Pengguna mendapat indikator koneksi terputus.
- Pengiriman form tidak diantrikan otomatis.
- Pengguna diminta kembali online sebelum mencatat data.

Offline submission belum diterapkan. Menyimpan request kesehatan secara lokal membutuhkan desain tambahan untuk enkripsi, duplicate prevention, conflict resolution, expiry, dan penghapusan data.

## Update lifecycle

- Service worker memeriksa update setiap satu jam selama aplikasi terbuka.
- Worker baru dapat menerima pesan `SKIP_WAITING`.
- File `sw.js` menggunakan cache header `must-revalidate`.
- Cache versi lama dengan prefix JejakSehat dibersihkan saat aktivasi.

## Verification

CI menjalankan:

1. ESLint.
2. TypeScript typecheck.
3. Unit tests.
4. Next.js production build.
5. Playwright mobile acceptance pada lebar 320px dan profil Pixel 5.
6. Manifest serta icon response checks.
7. Offline fallback checks.
8. Keyboard focus checks.
9. Lighthouse accessibility, best practices, SEO, dan performance review.

Performance Lighthouse bersifat warning karena nilai dapat berubah pada shared runner. Accessibility, best practices, dan SEO menjadi blocking quality gates.

## Remaining production checks

Beberapa pemeriksaan tetap membutuhkan deployment HTTPS nyata:

- Instalasi dari Chrome Android fisik.
- Add to Home Screen dari Safari iOS fisik.
- Service worker upgrade antardeployment.
- Offline navigation setelah kunjungan pertama.
- Lighthouse terhadap URL Vercel production.
- Login Google setelah aplikasi dibuka dari mode standalone.
