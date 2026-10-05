import type { Metadata } from "next";
import {
  GoogleTagManager,
  GoogleTagManagerNoscript,
} from "./components/google-tag-manager";
import "./globals.css";

export const metadata: Metadata = {
  title: "De la Idea a los Ingresos",
  description: "Convertí una idea en tu propio producto digital y aprendé a venderlo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <GoogleTagManager />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="antialiased">
        <GoogleTagManagerNoscript />
        {children}
      </body>
    </html>
  );
}
