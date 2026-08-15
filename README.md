# Zey Learn AI

AI Learning Architect — belajar konsep kompleks lewat analogi intuitif, quiz interaktif, dan reinforcement feedback loop yang tersinkron ke Zey Vault & VWV Studio untuk fine-tuning.

## Struktur Proyek

```
zey-learn-ai/
├── app/
│   ├── api/learn/route.ts     # API route utama (teach & feedback)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                # Learn, Review, Progress, Settings, Toast, Spinner
├── lib/
│   ├── system-prompt.ts       # System prompt Zey Learn AI Engine
│   ├── fetch-with-retry.ts    # Fetch wrapper: retry + timeout
│   ├── zey-ai-gateway.ts      # Klien Zey AI Gateway
│   ├── zey-search.ts          # Klien Zey Search
│   ├── zey-vault.ts           # Klien Zey Vault
│   └── vvv-studio.ts          # Klien VWV Studio (fine-tune trigger)
├── types/index.ts
└── __tests__/                 # Unit & integration test (Jest)
```

## Prasyarat

- Node.js 18.17 atau lebih baru
- npm (atau pnpm/yarn)

## Instalasi

```bash
npm install
```

## Konfigurasi Environment Variables

Salin `.env.example` menjadi `.env.local`, lalu isi sesuai kebutuhan:

```bash
cp .env.example .env.local
```

| Variabel | Keterangan |
|---|---|
| `ZEY_AI_GATEWAY_URL` | Endpoint Gateway Zey AI (chat completion) |
| `ZEY_AI_API_KEY` | API key untuk Gateway Zey AI & VWV Studio |
| `ZEY_SEARCH_API_URL` | Endpoint Zey Search untuk konteks internet |
| `ZEY_VAULT_API_URL` | Endpoint Zey Vault untuk menyimpan dataset symbiosis |
| `ZEY_VAULT_API_KEY` | API key untuk Zey Vault |
| `VWV_STUDIO_API_URL` | Endpoint VWV Studio untuk memicu fine-tune |

⚠️ **Jangan commit `.env.local`** (sudah ada di `.gitignore`). Untuk deployment, set variabel-variabel ini lewat dashboard Vercel → Project Settings → Environment Variables.

## Menjalankan di Local

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Testing

```bash
npm test           # jalankan semua test sekali
npm run test:watch # mode watch
```

Cakupan test:
- `__tests__/lib/fetch-with-retry.test.ts` — retry, backoff, status non-retryable, timeout
- `__tests__/lib/zey-search.test.ts`, `zey-vault.test.ts`, `vvv-studio.test.ts`, `zey-ai-gateway.test.ts` — integrasi tiap klien API eksternal
- `__tests__/api/learn.test.ts` — validasi input, orchestration, status code error route `/api/learn`

## Build & Deploy (Vercel)

```bash
npm run build
npm start   # cek hasil build secara lokal
```

Deploy lewat [Vercel](https://vercel.com): import repo, isi Environment Variables sesuai tabel di atas, lalu deploy.

## Catatan Perbaikan dari Kode Awal

- **`lib/system-prompt.ts` dibuat baru** — file ini di-import oleh `app/api/learn/route.ts` tapi belum ada di kode yang diberikan; isinya diambil dari dokumen system prompt "ZEY LEARN AI ENGINE".
- **Env var fine-tune diselaraskan ke `VWV_STUDIO_API_URL`** — kode asal memakai `VVV_STUDIO_API_URL`, tidak cocok dengan daftar environment variables yang diminta (nama file `lib/vvv-studio.ts` & fungsi `triggerVVVStudioFineTune` tetap dipertahankan supaya import di `route.ts` tidak berubah).
- **Retry + timeout** (`lib/fetch-with-retry.ts`, exponential backoff, `AbortController`) dipakai di semua klien eksternal: `zey-search`, `zey-vault`, `vvv-studio`, dan `zey-ai-gateway` (hasil ekstraksi pemanggilan gateway yang sebelumnya inline di `route.ts`, supaya lebih mudah di-unit-test).
- **`route.ts`**: validasi input diperketat (JSON tidak valid, `topic` kosong, `action` invalid, `feedbackText` wajib untuk `action: "feedback"`) dan status code disesuaikan dengan jenis error (400 untuk input tidak valid, status asli upstream atau 502 untuk kegagalan Zey AI Gateway, 500 untuk error tak terduga).
- **UI**: `LearnView` mendapat error alert, empty state, loading spinner, dan toast notification (menggantikan teks status inline). Tombol "Sync to Zey Vault & VWV Studio" saat ini masih mensimulasikan sinkronisasi di sisi client — penyimpanan sesungguhnya ke Zey Vault sudah terjadi otomatis di server begitu pengguna mengirim koreksi lewat "Kirim Koreksi".
- **`Navbar`** dibuat scroll horizontal agar tab tidak overflow di layar HP sempit; import `next/link` yang tidak terpakai dihapus.
- `components/settings-view.tsx` dibawa apa adanya — form-nya murni local state (belum ada handler simpan), jadi belum benar-benar mengubah konfigurasi server.
