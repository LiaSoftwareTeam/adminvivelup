import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./styles/dashboard.css";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Admin Dashboard",
  description: "Dashboard administrativo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="dashboard-container">
          <Sidebar />
          <div className="main-content">
            <Topbar />
            <div className="content-area">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
