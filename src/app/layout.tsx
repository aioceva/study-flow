import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Flow",
  description: "Учи по-лесно",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg">
      <body>
        <div style={{ maxWidth: "480px", margin: "0 auto" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
