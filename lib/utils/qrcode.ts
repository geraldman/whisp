import QRCode from 'qrcode';

/**
 * Generate QR code as base64 string
 */
export async function generateQRCode(data: string): Promise<string> {
  try {
    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });

    // Remove "data:image/png;base64," prefix
    const base64 = qrDataUrl.split(',')[1];
    return base64;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code as canvas (for browser rendering)
 */
export async function generateQRCodeCanvas(
  canvas: HTMLCanvasElement,
  data: string
): Promise<void> {
  try {
    await QRCode.toCanvas(canvas, data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (error) {
    console.error('QR Code canvas generation error:', error);
    throw new Error('Failed to generate QR code canvas');
  }
}
