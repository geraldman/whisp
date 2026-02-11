# Profile Feature - Dokumentasi

## ✅ Fitur yang Sudah Diperbaiki

### 1. **Profile Avatar yang Tersimpan Permanen**
- Avatar dapat dipilih dari 3 pilihan: window, globe, file
- Avatar tersimpan di Firestore
- Perubahan avatar langsung ter-update di database
- Loading state saat menyimpan avatar

**File terkait:**
- [ProfileAvatar.tsx](app/components/profile/ProfileAvatar.tsx)
- [updateAvatar.ts](app/actions/profile/updateAvatar.ts)

### 2. **QR Code yang Tersimpan Permanen**
- QR code di-generate di client menggunakan library `qrcode`
- Tersimpan di Google Sheets melalui Google Apps Script
- Flow: Cek GAS → Jika tidak ada, generate lokal → Save ke GAS
- Request berikutnya langsung load dari GAS (lebih cepat)
- Fitur Download & Share QR code
- Loading animation dan error handling yang baik

**File terkait:**
- [ProfileQR.tsx](app/components/profile/ProfileQR.tsx)
- [getQrFromGas.ts](app/actions/profile/getQrFromGas.ts)
- [qrcode.ts](lib/utils/qrcode.ts)
- [GOOGLE_APPS_SCRIPT_SETUP.md](GOOGLE_APPS_SCRIPT_SETUP.md)

### 3. **Security Improvements**
- Semua server actions menggunakan authentication check
- Session cookie verification menggunakan Firebase Admin SDK
- Password minimal 6 karakter
- Konfirmasi double untuk delete account

**File terkait:**
- [changePassword.ts](app/actions/profile/changePassword.ts)
- [deleteAccount.ts](app/actions/profile/deleteAccount.ts)
- [getUserProfile.ts](app/actions/profile/getUserProfile.ts)

### 4. **UI/UX Improvements**
- Loading states untuk semua operasi
- Error handling dan error messages yang jelas
- Styling yang lebih baik dengan border dan padding
- Konfirmasi yang lebih aman untuk operasi berbahaya

**File terkait:**
- [ProfileInfo.tsx](app/components/profile/ProfileInfo.tsx)
- [ProfileSecurity.tsx](app/components/profile/ProfileSecurity.tsx)
- [DangerZone.tsx](app/components/profile/DangerZone.tsx)
- [page.tsx](app/profile/page.tsx)

## 🔒 Keamanan

### Authentication
- Semua server actions memerlukan valid session cookie
- Session verification menggunakan `firebase-admin/auth`
- Auto redirect ke login jika tidak authenticated

### Data Protection
- Avatar disimpan di Firestore dengan user ID sebagai key
- QR code hanya bisa diakses oleh user yang authenticated
- Password di-hash oleh Firebase Authentication
- Delete account akan menghapus semua data user

### Code Example untuk Protect Route
```typescript
const cookieStore = await cookies();
const sessionCookie = cookieStore.get("session")?.value;

if (!sessionCookie) {
  throw new Error("Not authenticated");
}

const { auth } = await import("firebase-admin/auth");
const decodedToken = await auth().verifySessionCookie(sessionCookie, true);
const userId = decodedToken.uid;
```

## 📊 Data Structure di Firestore

### Collection: `users`
```typescript
{
  userId: string;
  email: string;
  username: string;
  numericId: string;
  avatar: string;        // "/window.svg" | "/globe.svg" | "/file.svg"
  createdAt: string;
  updatedAt: string;
}
```

### Google Sheets: `qr_users`
| numericId | qrBase64 | createdAt |
|-----------|----------|-----------|
| 123456    | iVBORw0K... | 2024-01-01T00:00:00Z |

## 🚀 Setup Instructions

### 1. Environment Variables
Pastikan file `.env.local` memiliki:
```
NEXT_PUBLIC_GAS_QR_ENDPOINT=https://script.google.com/macros/s/YOUR_ID/exec
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-client-email
FIREBASE_ADMIN_PRIVATE_KEY=your-private-key
```

### 2. Google Apps Script
Ikuti instruksi di [GOOGLE_APPS_SCRIPT_SETUP.md](GOOGLE_APPS_SCRIPT_SETUP.md)

### 3. Firestore Rules
Pastikan Firestore rules mengizinkan authenticated users untuk:
- Read own profile
- Update own avatar
- Delete own account

```
match /users/{userId} {
  allow read, update, delete: if request.auth.uid == userId;
}
```

## 🧪 Testing

### Test Avatar Update
1. Login ke aplikasi
2. Buka halaman Profile
3. Klik salah satu avatar button
4. Cek apakah avatar berubah
5. Refresh page - avatar harus tetap sama

### Test QR Code
1. Login dengan user baru
2. Buka halaman Profile
3. QR code akan di-generate pertama kali (di client)
4. QR otomatis tersimpan ke Google Sheets (jika configured)
5. Refresh page - QR code muncul lebih cepat (dari GAS)
6. Test Download QR code
7. Test Share QR code (jika browser support)

### Test Password Change
1. Masukkan password baru (min 6 karakter)
2. Klik "Ubah Password"
3. Logout dan login dengan password baru

### Test Delete Account
1. Klik "Hapus Akun Permanen"
2. Konfirmasi 2x
3. Account harus terhapus dan redirect ke login

## 📦 Dependencies

```json
{
  "qrcode": "^1.5.x",
  "@types/qrcode": "^1.5.x"
}
```

Install dengan: `npm install qrcode @types/qrcode`

## 🐛 Troubleshooting

**Avatar tidak tersimpan**
- Cek apakah session cookie valid
- Cek Firestore rules
- Cek console untuk error messages

**QR code tidak muncul**
- Cek `NEXT_PUBLIC_GAS_QR_ENDPOINT` di `.env.local`
- Cek Google Apps Script deployment
- Cek network tab di browser

**Password change gagal**
- Pastikan password minimal 6 karakter
- Cek apakah user masih authenticated
- Cek Firebase Admin SDK configuration

## 📝 Next Steps (Optional)

- [ ] Tambah fitur upload custom avatar image
- [ ] Tambah fitur download QR code
- [ ] Tambah fitur share QR code
- [ ] Tambah 2FA (Two-Factor Authentication)
- [ ] Tambah email verification untuk password change
- [ ] Tambah activity log untuk security events
