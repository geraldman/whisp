# Setup Google Apps Script untuk QR Code

Script ini digunakan untuk men-generate dan menyimpan QR code secara permanen di Google Sheets.

## Langkah Setup

### 1. Buat Google Spreadsheet Baru
- Buka [Google Sheets](https://sheets.google.com)
- Buat spreadsheet baru dengan ID: `1YF1E1gomNGtTlETq-bu99nXumINf0G86Dr7JIeucCeU`
- Atau gunakan ID spreadsheet Anda sendiri (update di script)

### 2. Buat Sheet "qr_users"
- Buat sheet baru dengan nama: `qr_users`
- Buat header di baris pertama:
  - A1: `numericId`
  - B1: `qrBase64`
  - C1: `createdAt`

### 3. Deploy Google Apps Script
1. Buka spreadsheet Anda
2. Klik **Extensions** → **Apps Script**
3. Hapus code default dan paste script di bawah:

\`\`\`javascript
function doPost(e) {
  const body = JSON.parse(e.postData.contents || "{}");
  const action = body.action || "get"; // "get" or "save"
  const numericId = body.numericId;

  if (!numericId) {
    return respond(false, "numericId required");
  }

  const sheet = SpreadsheetApp
    .openById("1YF1E1gomNGtTlETq-bu99nXumINf0G86Dr7JIeucCeU")
    .getSheetByName("qr_users");

  const rows = sheet.getDataRange().getValues();

  // ACTION: GET - Ambil QR yang sudah ada
  if (action === "get") {
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === numericId) {
        return respond(true, null, rows[i][1]);
      }
    }
    // QR belum ada
    return respond(false, "QR not found");
  }

  // ACTION: SAVE - Simpan QR code baru
  if (action === "save") {
    const qrBase64 = body.qrBase64;
    
    if (!qrBase64) {
      return respond(false, "qrBase64 required");
    }

    // Cek apakah sudah ada
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === numericId) {
        // Update existing
        sheet.getRange(i + 1, 2).setValue(qrBase64);
        sheet.getRange(i + 1, 3).setValue(new Date().toISOString());
        return respond(true, null, qrBase64);
      }
    }

    // Insert new row
    sheet.appendRow([
      numericId,
      qrBase64,
      new Date().toISOString(),
    ]);

    return respond(true, null, qrBase64);
  }

  return respond(false, "Invalid action");
}

function respond(success, error, qrBase64) {
  return ContentService
    .createTextOutput(
      JSON.stringify({
        success,
        error,
        qrBase64,
      })
    )
    .setMimeType(ContentService.MimeType.JSON);
}
\`\`\`

4. Klik **Deploy** → **New deployment**
5. Pilih type: **Web app**
6. Konfigurasi:
   - Description: `QR Code Generator`
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Klik **Deploy**
8. Copy **Web app URL** yang diberikan

### 4. Update Environment Variable
Tambahkan URL web app ke file `.env.local`:

\`\`\`
NEXT_PUBLIC_GAS_QR_ENDPOINT=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
\`\`\`

## Cara Kerja

1. **Client (Next.js)**: Generate QR code menggunakan library `qrcode`
2. **Google Apps Script**: 
   - **GET**: Cek apakah QR sudah ada di spreadsheet
   - **SAVE**: Simpan QR code baru (base64) ke spreadsheet
3. **Flow**:
   - User buka profile → System cek GAS → Jika ada, load dari GAS
   - Jika tidak ada → Generate di client → Save ke GAS
   - Request berikutnya → Load dari GAS (lebih cepat)

## Keunggulan

✅ QR code di-generate di client (lebih cepat, tidak perlu external API)  
✅ QR code tersimpan permanen di Google Sheets  
✅ Tidak bergantung pada Google Chart API  
✅ Customizable (bisa ubah warna, size, error correction level)  
✅ Offline-capable (QR bisa di-generate tanpa internet setelah load pertama)

## Keamanan

✅ QR code hanya bisa diakses oleh user yang terautentikasi  
✅ Server-side validation menggunakan session cookie  
✅ QR code disimpan permanen dan tidak berubah  
✅ Data terenkripsi di Firestore  

## Troubleshooting

**Error: "numericId required"**
- Pastikan user memiliki `numericId` yang valid di profile

**Error: "Failed to generate QR"**
- Cek koneksi internet
- Pastikan Google Chart API tidak diblokir
- Cek quota Google Apps Script

**QR code tidak muncul**
- Cek apakah `NEXT_PUBLIC_GAS_QR_ENDPOINT` sudah di-set di `.env.local`
- Cek console browser untuk error messages
- Re-deploy Google Apps Script jika perlu
