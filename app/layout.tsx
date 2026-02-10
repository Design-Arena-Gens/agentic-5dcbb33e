import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pocket Notes",
  description: "Mobile-first notes app with tags and search"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

const fontSans = ["Inter", "ui-sans-serif", "system-ui", "sans-serif"].join(", ");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: fontSans
        }}
      >
        {children}
      </body>
    </html>
  );
}
