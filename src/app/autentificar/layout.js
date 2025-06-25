import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Iniciar Sesión - Admin Dashboard",
  description: "Página de inicio de sesión para el dashboard administrativo",
};

export default function AuthLayout({ children }) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable}`}>
      {children}
    </div>
  );
}