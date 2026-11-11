# Deploy ke Hostinger (paket Premium) + Supabase

Situs Black Amatis adalah **situs statis**: `npm run build` menghasilkan folder `out/` berisi file HTML/JS/CSS biasa.
Folder itu di-upload ke `public_html` milik subdomain. Data, login editor, dan foto/PDF ada di **Supabase**
(project `black-amatis`, region Singapore), diambil langsung oleh browser.

> **Penting**
> - Jangan ubah nameserver atau record DNS yang sudah ada. Domain ini sudah dipakai subdomain lain.
>   Yang ditambahkan hanya subdomain `blackamatis`.
> - Jangan pernah menaruh **service-role key** Supabase di file `.env` situs ini. Semua yang ada di situs statis bisa dilihat publik.

---

## 1. Sekali saja: buat subdomain

1. Login hPanel → **Websites** → pilih website domain utama → **Domains → Subdomains**.
2. Buat subdomain `blackamatis` (hasilnya `blackamatis.<domain>`).
   Catat folder yang dibuat hPanel, biasanya `public_html/blackamatis` atau `domains/blackamatis.<domain>/public_html`.
3. Jika DNS domain **tidak** dikelola Hostinger: di pengelola DNS, tambahkan **hanya** record `A` untuk `blackamatis`
   yang mengarah ke IP hosting (lihat hPanel → Hosting → Details). Record lain jangan disentuh.
4. hPanel → **Security → SSL**: pasang SSL gratis untuk `blackamatis.<domain>`. Tunggu sampai statusnya aktif.

## 2. Sekali saja: atur Supabase

1. Supabase Dashboard → project **black-amatis** → **Authentication → URL Configuration**:
   - **Site URL**: `https://blackamatis.<domain>`
   - **Redirect URLs**: `https://blackamatis.<domain>/**`
2. **Authentication → Users → Add user → Create new user** untuk setiap anggota tim (centang *Auto Confirm User*).
3. Beri tahu developer email-email tersebut beserta perannya (`owner` boleh Publish, `editor` hanya menyimpan draft),
   supaya ditambahkan ke tabel `editors`.

## 3. Setiap kali kode berubah: build

Di komputer yang sudah terpasang Node.js 20 atau lebih baru:

```bash
git pull
npm ci
```

Buat file `.env.production.local` di folder proyek (tidak ikut ke GitHub) berisi:

| Nama variabel | Isi |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase (Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *Publishable key* / *anon key* (Settings → API Keys). Bukan service-role key! |
| `NEXT_PUBLIC_SITE_URL` | `https://blackamatis.<domain>` (dipakai untuk QR code) |

Lalu:

```bash
npm run build
```

Hasilnya ada di folder `out/`.

## 4. Upload

1. hPanel → **Files → File Manager** → buka folder subdomain dari langkah 1.2.
2. Hapus isi lama di folder itu (kalau ada), **kecuali** file/folder yang bukan milik situs ini.
3. Upload **isi** folder `out/` (bukan foldernya). Cara cepat: kompres isi `out/` menjadi `.zip`, upload, lalu
   klik kanan → **Extract**.
   Pastikan file tersembunyi `.htaccess` ikut ter-upload (di File Manager aktifkan *Show hidden files*).
4. Alternatif: FTP (hPanel → Files → FTP Accounts), upload isi `out/` ke folder yang sama.

## 5. Cek

Buka di browser (juga di HP):

- `https://blackamatis.<domain>/`
- `https://blackamatis.<domain>/installation/` → klik produk di diagram, popover spesifikasi muncul
- `https://blackamatis.<domain>/judge/` → tombol *Download evidence pack (PDF)*
- `https://blackamatis.<domain>/editor/login/` → login dengan akun tim, coba *Save draft* dan *Publish*
- `https://blackamatis.<domain>/halaman-asal` → harus muncul halaman 404

## Kapan perlu build + upload ulang?

| Perubahan | Perlu upload ulang? |
|---|---|
| Isi konten lewat editor (teks, foto, komponen, bonus) lalu **Publish** | **Tidak**. Situs mengambil data terbaru dari Supabase. |
| Kode/desain situs berubah | Ya |
| Domain berubah (QR code) | Ya, ubah `NEXT_PUBLIC_SITE_URL` lalu build ulang sebelum mencetak QR |

## QR code untuk display A4

QR dibuat saat build dari `NEXT_PUBLIC_SITE_URL`. Setelah domain final dan situs ter-upload, buka
`https://blackamatis.<domain>/print/qr/`, cek QR dengan HP, lalu cetak (A4, tanpa margin).
