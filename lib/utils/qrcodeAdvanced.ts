import QRCode from 'qrcode';

/**
 * Advanced QR Code Generator dengan customization
 */

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Generate custom QR code dengan options
 */
export async function generateCustomQRCode(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    width = 300,
    margin = 2,
    darkColor = '#000000',
    lightColor = '#FFFFFF',
    errorCorrectionLevel = 'M',
  } = options;

  try {
    const qrDataUrl = await QRCode.toDataURL(data, {
      width,
      margin,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel,
    });

    const base64 = qrDataUrl.split(',')[1];
    return base64;
  } catch (error) {
    console.error('Custom QR Code generation error:', error);
    throw new Error('Failed to generate custom QR code');
  }
}

/**
 * Generate QR code dengan logo di tengah
 * Note: Requires canvas manipulation in browser
 */
export async function generateQRCodeWithLogo(
  data: string,
  logoUrl: string,
  options: QRCodeOptions = {}
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Generate QR on canvas
      await QRCode.toCanvas(canvas, data, {
        width: options.width || 300,
        margin: options.margin || 2,
        color: {
          dark: options.darkColor || '#000000',
          light: options.lightColor || '#FFFFFF',
        },
        errorCorrectionLevel: options.errorCorrectionLevel || 'H', // High for logo overlay
      });

      // Load logo
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      
      logo.onload = () => {
        // Calculate logo size (20% of QR size)
        const logoSize = canvas.width * 0.2;
        const logoX = (canvas.width - logoSize) / 2;
        const logoY = (canvas.height - logoSize) / 2;

        // Draw white background for logo
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);

        // Draw logo
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

        // Convert to base64
        const base64 = canvas.toDataURL('image/png').split(',')[1];
        resolve(base64);
      };

      logo.onerror = () => {
        reject(new Error('Failed to load logo'));
      };

      logo.src = logoUrl;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Presets untuk QR code themes
 */
export const QR_THEMES = {
  default: {
    darkColor: '#000000',
    lightColor: '#FFFFFF',
  },
  blue: {
    darkColor: '#0070f3',
    lightColor: '#FFFFFF',
  },
  gradient: {
    darkColor: '#6366f1',
    lightColor: '#f0f9ff',
  },
  dark: {
    darkColor: '#FFFFFF',
    lightColor: '#1a1a1a',
  },
  green: {
    darkColor: '#10b981',
    lightColor: '#FFFFFF',
  },
  purple: {
    darkColor: '#8b5cf6',
    lightColor: '#FFFFFF',
  },
  red: {
    darkColor: '#ef4444',
    lightColor: '#FFFFFF',
  },
};

/**
 * Example usage:
 * 
 * // Basic custom QR
 * const qr = await generateCustomQRCode('data', {
 *   width: 400,
 *   darkColor: '#0070f3',
 *   lightColor: '#f0f9ff'
 * });
 * 
 * // QR with theme
 * const qr = await generateCustomQRCode('data', QR_THEMES.blue);
 * 
 * // QR with logo
 * const qr = await generateQRCodeWithLogo('data', '/logo.png', {
 *   width: 400,
 *   errorCorrectionLevel: 'H'
 * });
 */
