import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CV Creator — Build ATS-Friendly Resumes That Get You Hired",
  description:
    "Create stunning, ATS-optimized resumes with real-time preview, 6+ templates, and built-in ATS score analyzer. Free, no sign-up required.",
  keywords: "resume builder, CV creator, ATS friendly, resume templates, job application",
  manifest: "/manifest.json",
  themeColor: "#6366f1",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
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
