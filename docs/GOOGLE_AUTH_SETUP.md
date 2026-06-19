# Google Authentication Setup

JejakSehat menggunakan Auth.js dengan Google OAuth dan JWT session. Google OAuth hanya menangani identitas pengguna. Akses ke spreadsheet tetap memakai service account terpisah di server.

## 1. Siapkan OAuth consent screen

1. Buka Google Cloud Console dan pilih project JejakSehat.
2. Buka Google Auth Platform / OAuth consent screen.
3. Isi nama aplikasi, support email, dan developer contact.
4. Untuk tahap development, gunakan status Testing dan tambahkan akun yang boleh login sebagai test user.
5. Gunakan scope identitas dasar saja: `openid`, `email`, dan `profile`.

## 2. Buat OAuth client

1. Buka Credentials / Clients.
2. Pilih **Create Client**.
3. Pilih application type **Web application**.
4. Tambahkan authorized JavaScript origins:

```text
http://localhost:3000
https://domain-produksi.example
```

5. Tambahkan authorized redirect URIs:

```text
http://localhost:3000/api/auth/callback/google
https://domain-produksi.example/api/auth/callback/google
```

Redirect URI harus sama persis, termasuk protocol, domain, port, path, dan trailing slash.

## 3. Konfigurasi environment lokal

Salin file environment:

```bash
cp .env.example .env.local
```

Generate secret Auth.js:

```bash
npx auth secret
```

Isi credential OAuth:

```env
AUTH_GOOGLE_ID=your-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your-client-secret
AUTH_TRUST_HOST=true
```

Jangan memasukkan `.env.local`, client secret, atau credential service account ke Git.

## 4. Konfigurasi Google Sheets

Authentication pengguna dan service account adalah dua credential berbeda.

```env
DATA_PROVIDER=sheets
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Bagikan spreadsheet kepada `GOOGLE_SERVICE_ACCOUNT_EMAIL` sebagai Editor, kemudian jalankan:

```bash
npm run sheets:init
```

Tab `users` harus memiliki kolom:

```text
id | google_subject | email | name | avatar_url | timezone | created_at | updated_at | deleted_at
```

## 5. Jalankan aplikasi

```bash
npm install
npm run dev
```

Buka:

```text
http://localhost:3000/login
```

Setelah login berhasil:

1. Profil Google diverifikasi memiliki email terverifikasi.
2. User dicari berdasarkan `google_subject`.
3. User baru mendapat UUID internal.
4. Login berikutnya menggunakan UUID internal yang sama.
5. UUID dimasukkan ke JWT dan server-side session sebagai `session.user.id`.

## 6. Konfigurasi Vercel

Tambahkan seluruh environment variables melalui Project Settings → Environment Variables. Gunakan domain deployment aktual pada authorized origin dan redirect URI Google.

Setelah domain berubah, tambahkan callback baru di Google Cloud sebelum menguji login.

## 7. Pemeriksaan keamanan

- Email tidak digunakan sebagai primary key.
- Browser tidak mengirim atau menentukan `user_id`.
- Access token dan refresh token Google tidak disimpan oleh aplikasi.
- Private key service account hanya tersedia di server.
- Dashboard memeriksa session melalui proxy dan Server Component.
- Endpoint private harus mengambil UUID dari session server-side.
- Jika ada lebih dari satu baris dengan `google_subject` sama, login dihentikan sebagai data integrity error.

## Troubleshooting

### `redirect_uri_mismatch`

Pastikan callback Google sama persis dengan:

```text
<APP_URL>/api/auth/callback/google
```

### `Configuration`

Periksa `AUTH_SECRET`, `AUTH_GOOGLE_ID`, dan `AUTH_GOOGLE_SECRET`.

### Login berhasil di Google tetapi kembali ke halaman error

Periksa konfigurasi service account, akses spreadsheet, tab `users`, dan header spreadsheet.

### User tidak dapat masuk saat aplikasi masih Testing

Tambahkan email pengguna ke daftar test users pada OAuth consent screen.
