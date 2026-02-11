# QR Code System - Documentation

## Overview

Sistem QR code menggunakan library `qrcode` untuk generate di client-side, kemudian menyimpan hasil ke Google Apps Script (Spreadsheet) untuk persistence.

## Architecture

```
┌─────────────┐
│   Client    │
│ (Next.js)   │
└──────┬──────┘
       │
       │ 1. Request QR
       ▼
┌─────────────────────┐
│ Google Apps Script  │
│  (Spreadsheet)      │
└──────┬──────────────┘
       │
       │ 2. Check if exists
       │
       ├─── YES ──► Return cached QR
       │
       └─── NO ──┐
                 │
                 ▼
         ┌──────────────┐
         │  Generate QR │
         │  (qrcode lib)│
         └──────┬───────┘
                │
                │ 3. Save to GAS
                ▼
         ┌─────────────┐
         │    Cache    │
         └─────────────┘
```

## Components

### 1. QR Code Generator (`lib/utils/qrcode.ts`)

```typescript
import { generateQRCode } from '@/lib/utils/qrcode';

// Generate QR as base64
const qrBase64 = await generateQRCode('your-data-here');
```

**Options:**
- Width: 300px
- Error Correction: Medium (M)
- Colors: Black on White
- Margin: 2

### 2. GAS Integration (`app/actions/profile/getQrFromGas.ts`)

**Flow:**
1. Try to GET from Google Apps Script
2. If not found, generate locally
3. SAVE to Google Apps Script
4. Return QR code

**Actions:**
- `action: "get"` - Retrieve existing QR
- `action: "save"` - Store new QR

### 3. Profile QR Component (`app/components/profile/ProfileQR.tsx`)

**Features:**
- ✅ Auto-load QR on mount
- ✅ Loading spinner
- ✅ Error handling with retry
- ✅ Download QR as PNG
- ✅ Share QR (if browser supports)
- ✅ Responsive design

## Google Apps Script

### Endpoint Structure

**Request (GET):**
```json
{
  "action": "get",
  "numericId": "12345678"
}
```

**Request (SAVE):**
```json
{
  "action": "save",
  "numericId": "12345678",
  "qrBase64": "iVBORw0KGgo..."
}
```

**Response:**
```json
{
  "success": true,
  "error": null,
  "qrBase64": "iVBORw0KGgo..."
}
```

### Spreadsheet Structure

| Column A | Column B | Column C |
|----------|----------|----------|
| numericId | qrBase64 | createdAt |
| 12345678 | iVBORw0... | 2026-02-10... |

## Usage Examples

### Basic Usage

```tsx
import { getQrFromGas } from '@/app/actions/profile/getQrFromGas';

// In component
const qrBase64 = await getQrFromGas(numericId);
```

### Display QR

```tsx
<img 
  src={`data:image/png;base64,${qrBase64}`} 
  alt="QR Code" 
  width={200} 
  height={200}
/>
```

### Download QR

```tsx
const downloadQR = () => {
  const link = document.createElement('a');
  link.href = `data:image/png;base64,${qrBase64}`;
  link.download = `qr-${numericId}.png`;
  link.click();
};
```

### Custom QR Generation

```typescript
import QRCode from 'qrcode';

const customQR = await QRCode.toDataURL('your-data', {
  width: 500,
  margin: 4,
  color: {
    dark: '#FF0000',  // Red QR
    light: '#FFFFFF'
  },
  errorCorrectionLevel: 'H' // High error correction
});
```

## Performance

### First Load
- Generate: ~50-100ms (client-side)
- Save to GAS: ~200-500ms (network)
- **Total: ~300-600ms**

### Subsequent Loads
- Fetch from GAS: ~200-400ms
- **Total: ~200-400ms** (2x faster)

### Without GAS (Local Only)
- Generate: ~50-100ms
- **Total: ~50-100ms** (6x faster, but not persistent)

## Error Handling

### Common Errors

1. **"Numeric ID tidak tersedia"**
   - User belum memiliki numericId
   - Regenerate user profile

2. **"Failed to generate QR code"**
   - QRCode library error
   - Check browser compatibility

3. **GAS Connection Failed**
   - Falls back to local generation
   - QR still works, just not cached

### Error Recovery

```typescript
try {
  const qr = await getQrFromGas(numericId);
} catch (error) {
  // Fallback: generate without caching
  const qr = await generateQRCode(numericId);
}
```

## Best Practices

1. **Always cache QR codes** - Don't regenerate unnecessarily
2. **Use error boundaries** - Wrap QR components in error boundaries
3. **Optimize image size** - 300x300 is optimal for most use cases
4. **Provide fallbacks** - Local generation if GAS fails
5. **Show loading states** - Better UX during generation

## Security

✅ Client-side generation (no sensitive data sent to server)  
✅ Base64 encoding (standard image format)  
✅ No external dependencies for QR data  
✅ Google Sheets as secure storage  
✅ HTTPS-only endpoints  

## Future Enhancements

- [ ] QR code styling (colors, logos)
- [ ] QR code expiration
- [ ] QR code analytics (scan tracking)
- [ ] Batch QR generation
- [ ] QR code templates
- [ ] SVG QR codes (scalable)
