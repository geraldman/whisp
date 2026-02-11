# Quick Start - QR Code Feature

## Installation

```bash
npm install qrcode @types/qrcode
```

## Setup (Optional - for persistence)

### 1. Create Google Spreadsheet

1. Buat spreadsheet baru di Google Sheets
2. Buat sheet bernama `qr_users` dengan header:
   - A1: `numericId`
   - B1: `qrBase64`
   - C1: `createdAt`

### 2. Deploy Google Apps Script

1. Buka **Extensions** → **Apps Script**
2. Paste code dari [GOOGLE_APPS_SCRIPT_SETUP.md](GOOGLE_APPS_SCRIPT_SETUP.md)
3. Deploy sebagai Web App
4. Copy deployment URL

### 3. Environment Variable

Tambahkan ke `.env.local`:

```env
NEXT_PUBLIC_GAS_QR_ENDPOINT=https://script.google.com/macros/s/YOUR_ID/exec
```

> **Note:** Tanpa GAS, QR tetap berfungsi tapi tidak tersimpan permanen

## Usage

### Display QR in Profile

```tsx
import ProfileQR from '@/app/components/profile/ProfileQR';

<ProfileQR numericId={user.numericId} />
```

### Generate QR Manually

```typescript
import { generateQRCode } from '@/lib/utils/qrcode';

const qrBase64 = await generateQRCode('12345678');
```

### Get QR with Caching

```typescript
import { getQrFromGas } from '@/app/actions/profile/getQrFromGas';

const qrBase64 = await getQrFromGas('12345678');
```

## Features

✅ **Client-side generation** - Fast, no server call  
✅ **Persistent storage** - Save to Google Sheets (optional)  
✅ **Download** - Download QR as PNG  
✅ **Share** - Share QR via Web Share API  
✅ **Error handling** - Automatic retry on failure  
✅ **Loading states** - Smooth UX  

## Testing

1. Login ke aplikasi
2. Buka `/profile`
3. QR code otomatis generate
4. Test download & share buttons
5. Refresh page - QR load dari cache (jika GAS configured)

## Files Modified

- ✅ [ProfileQR.tsx](app/components/profile/ProfileQR.tsx) - UI Component
- ✅ [getQrFromGas.ts](app/actions/profile/getQrFromGas.ts) - Data fetching
- ✅ [qrcode.ts](lib/utils/qrcode.ts) - QR generator utility
- ✅ [GOOGLE_APPS_SCRIPT_SETUP.md](GOOGLE_APPS_SCRIPT_SETUP.md) - GAS setup guide
- ✅ [QR_CODE_SYSTEM.md](QR_CODE_SYSTEM.md) - Complete documentation

## Troubleshooting

**QR tidak muncul?**
- Cek console untuk error messages
- Pastikan `numericId` tersedia
- Test tanpa GAS (hapus env variable)

**Download tidak berfungsi?**
- Cek browser permissions
- Pastikan popup tidak diblock

**Share tidak muncul?**
- Web Share API hanya tersedia di HTTPS
- Tidak semua browser support (fallback: download)

## Next Steps

- [ ] Setup Google Apps Script (optional)
- [ ] Test QR code generation
- [ ] Test download & share
- [ ] Customize QR styling (warna, logo, dll)

---

**Need help?** Check [QR_CODE_SYSTEM.md](QR_CODE_SYSTEM.md) for detailed documentation.
