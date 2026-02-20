import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300","400","500","600","700"],
  variable: "--font-poppins",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Whispxr - Secure End-to-End Encrypted Messaging",
  description: "Connect securely with Whispxr. End-to-end encrypted messaging for private conversations.",
  keywords: ["whisp", "whispxr","secure messaging", "encrypted chat", "end-to-end encryption", "private messaging", "secure communication", "encrypted conversations"],
  authors: [{ name: "Whispxr Team" }],
  creator: "Whispxr",
  publisher: "Whispxr",
  
  // Open Graph metadata for social sharing
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://whispxr.vercel.app",
    siteName: "Whispxr",
    title: "Whispxr - Secure End-to-End Encrypted Messaging",
    description: "Connect securely with Whispxr. End-to-end encrypted messaging for private conversations.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Whispxr - Secure Messaging",
      },
    ],
  },
  
  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "Whispxr - Secure End-to-End Encrypted Messaging",
    description: "Connect securely with Whispxr. End-to-end encrypted messaging for private conversations.",
    images: ["/logo.png"],
    creator: "@yourTwitterHandle",
  },
  
  // Robots directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Additional metadata
  alternates: {
    canonical: "https://whispxr.vercel.app",
  },
  
  // Verification tags (add your verification codes)
  verification: {
    google: "7MMU1TnG7bb0YdzCdZW1Xc48ckt48i3Or_ljcs9uzA4",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured Data (JSON-LD) for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Whispxr",
    "url": "https://whispxr.vercel.app",
    "description": "Connect securely with Whispxr. End-to-end encrypted messaging for private conversations.",
    "applicationCategory": "CommunicationApplication",
    "operatingSystem": "All",
    // "offers": {
    //   "@type": "Offer",
    //   "price": "0.00",
    //   "priceCurrency": "USD"
    // },
    "featureList": [
      "End-to-end encryption",
      "Secure messaging",
      "Private conversations",
      "Real-time chat"
    ]
  };

  return (
    <html lang="en" className={`${poppins.variable} ${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
