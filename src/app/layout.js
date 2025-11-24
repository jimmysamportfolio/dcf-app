import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Valuation Lab",
  description: "DCF Creation App",
  icons: {
    icon: "/Gemini_Generated_Image_9k4b109k4b109k4b-removebg-preview.png",
    shortcut: "/Gemini_Generated_Image_9k4b109k4b109k4b-removebg-preview.png",
  },
  openGraph: {
    images: [
      
      "/Gemini_Generated_Image_9k4b109k4b109k4b-removebg-preview.png",
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body className={`${inter.className}`}>
        <div className="navbar bg-base-100 shadow-sm">
          <div className="navbar-start">
              <a className="btn btn-ghost text-xl">Valuation Lab</a>
              <img
                src="/Gemini_Generated_Image_9k4b109k4b109k4b-removebg-preview.png"
                alt="3D logo"
                className="max-w-16"
              />
          </div>
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/models">Models</Link>
              </li>
            </ul>
          </div>
          <div className="navbar-end">
            <a className="btn">Button</a>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
