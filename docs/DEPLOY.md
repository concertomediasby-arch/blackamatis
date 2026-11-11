# Deploy: GitHub Pages + DNS Hostinger + Supabase

Alamat situs: **https://blackamatis.concerto.id**

Situs Black Amatis adalah **situs statis** yang di-hosting di **GitHub Pages**, sama seperti subdomain `hub` dan `dealer`.
Hostinger hanya dipakai untuk **DNS** domain `concerto.id`. Data, login editor, serta foto/PDF ada di **Supabase**
(project `black-amatis`, region Singapore) dan diambil langsung oleh browser.

> **Penting**
> - Jangan ubah nameserver atau record DNS yang sudah ada (`www`, `hub`, `dealer`, `app`, `@`). Yang ditambahkan hanya **satu** record baru: `blackamatis`.
> - Jangan pernah menaruh *service-role key* / *secret key* Supabase di repo. Repo ini publik dan situsnya statis.

---

## A. Persiapan sekali saja

### 1. Jadikan repo publik
GitHub → repo **concertomediasby-arch/blackamatis** → **Settings → General** → bagian paling bawah *Danger Zone* →
**Change repository visibility → Public**.

### 2. Branch `main`
Situs di-deploy otomatis dari branch **`main`**. Pastikan branch `main` ada dan dijadikan default:
**Settings → General → Default branch → `main`**.

### 3. Aktifkan GitHub Pages
**Settings → Pages → Build and deployment → Source: GitHub Actions**.

### 4. Tambah satu record DNS di Hostinger
hPanel → **Domain** → `concerto.id` → **DNS / Nameserver** → **Kelola DNS record**, lalu isi:

| Tipe | Nama | Value / Target | TTL |
|---|---|---|---|
| `CNAME` | `blackamatis` | `concertomediasby-arch.github.io` | biarkan default |

Klik **Tambah Record**. Jangan klik *Impor*, dan jangan edit atau hapus record lain.

### 5. Jalankan deploy pertama
GitHub → **Actions** → **Deploy to GitHub Pages** → **Run workflow** (branch `main`).
Tunggu sampai centang hijau (sekitar 2–4 menit).

### 6. Pasang domain dan HTTPS
**Settings → Pages → Custom domain**: isi `blackamatis.concerto.id` → **Save**.
Tunggu sampai *DNS check successful* (bisa beberapa menit sampai beberapa jam), lalu centang **Enforce HTTPS**.

### 7. Atur Supabase
Supabase Dashboard → project **black-amatis** → **Authentication → URL Configuration**:
- **Site URL**: `https://blackamatis.concerto.id`
- **Redirect URLs**: `https://blackamatis.concerto.id/**`

### 8. Akun tim
**Authentication → Users → Add user → Create new user** untuk setiap anggota tim (centang *Auto Confirm User*).
Beri tahu developer email-email tersebut beserta perannya (`owner` boleh Publish, `editor` hanya menyimpan draft),
supaya ditambahkan ke tabel `editors`.

---

## B. Sehari-hari

| Perubahan | Yang perlu dilakukan |
|---|---|
| Isi konten lewat editor (teks, foto, komponen, bonus) lalu **Publish** | **Tidak ada.** Situs mengambil data terbaru dari Supabase. |
| Kode atau desain situs berubah | Merge/push ke `main`. GitHub Actions otomatis build dan deploy (2–4 menit). |
| Domain berubah | Ubah `NEXT_PUBLIC_SITE_URL` di `.env.production` dan `public/CNAME`, lalu push ke `main`. Cetak ulang QR. |

Nilai build (URL Supabase, *publishable key*, alamat situs) ada di `.env.production`. Isinya memang publik.

## C. Cek setelah deploy

Buka di browser (juga di HP):

- `https://blackamatis.concerto.id/`
- `https://blackamatis.concerto.id/installation/` → klik produk di diagram, popover spesifikasi muncul
- `https://blackamatis.concerto.id/judge/` → tombol *Download evidence pack (PDF)*
- `https://blackamatis.concerto.id/editor/login/` → login dengan akun tim, coba *Save draft* dan *Publish*
- `https://blackamatis.concerto.id/halaman-asal` → harus muncul halaman 404

## D. QR code untuk display A4

QR dibuat saat build dari `NEXT_PUBLIC_SITE_URL` (`https://blackamatis.concerto.id`).
Setelah situs online, buka `https://blackamatis.concerto.id/print/qr/`, pindai QR dengan HP untuk memastikan,
lalu cetak (A4, tanpa margin).

## Build manual (opsional)

Untuk mengecek hasil build di komputer sendiri (Node.js 20+):

```bash
npm ci
npm run build      # hasil di folder out/
npm run preview    # buka http://localhost:3000
```
