import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://openresume.top";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "OpenResume — The Best Free Open Source Resume Builder",
    template: "%s | OpenResume",
  },
  description:
    "Build your professional, ATS-friendly resume in minutes with OpenResume. Free, open-source, and privacy-focused resume builder with real-time preview.",
  keywords: [
    "OpenResume",
    "open resume",
    "resume top",
    "free resume builder",
    "ATS friendly resume",
    "open source resume builder",
    "pdf resume maker",
    "cv creator",
    "job application",
    "curriculum vitae",
  ],
  authors: [{ name: "Induwara Pathirana", url: "https://github.com/induwarapathirana" }],
  creator: "Induwara Pathirana",
  publisher: "OpenResume",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "OpenResume — The Best Free Open Source Resume Builder",
    description: "Build your professional, ATS-friendly resume in minutes with OpenResume. Free, open-source, and privacy-focused.",
    url: baseUrl,
    siteName: "OpenResume",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OpenResume Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenResume — The Best Free Open Source Resume Builder",
    description: "Build your professional, ATS-friendly resume in minutes with OpenResume. Free, open-source, and privacy-focused.",
    creator: "@induwarapathirana",
    images: ["/og-image.png"],
  },
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          data-name="BMC-Widget"
          data-cfasync="false"
          src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
          data-id="induwarapathirana"
          data-description="Support me on Buy me a coffee!"
          data-message="Buy me a coffee"
          data-color="#5F7FFF"
          data-position="Right"
          data-x_margin="18"
          data-y_margin="18"
        ></script>
        {children}
      </body>
    </html>
  );
}
