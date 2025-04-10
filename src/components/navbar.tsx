"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react"; // Menu = Hamburger, X = Close
import LockstopLogo from "../../public/Lockstop-icon.svg";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
  const handleLogout = () => {
    Cookies.remove("auth_token"); // Remove the auth_token cookie
    router.push("/"); // Redirect to homepage
  };

  return (
    <>
      <nav className="bg-orange-600 text-white p-4 fixed top-0 left-0 w-full z-50 shadow-md mb-7 border-2 border-amber-600">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="text-2xl font-bold">
            <Link href="/">
              <Image src={LockstopLogo} width={150} height={100} alt="Logo" />
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden sm:flex items-center space-x-6 text-sm font-semibold">
            <a
              href="https://www.lockstop.co/lockstopinsider"
              className="hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              LOCKSTOP INSIDER
            </a>
            <a
              href="https://www.lockstop.co/faqs"
              className="hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              FAQ
            </a>
            <a
              href="https://www.lockstop.co/blog"
              className="hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              BLOG
            </a>
            <button
              onClick={handleLogout}
              className="bg-orange-700 hover:bg-orange-800 text-white font-semibold py-2 px-4 rounded transition"
            >
              Logout
            </button>
          </div>

          {/* Hamburger Button - mobile only */}
          <button
            className="sm:hidden text-2xl"
            onClick={toggleDrawer}
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Drawer Overlay */}
      <div
        className={`fixed inset-0 bg-gray-300/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isDrawerOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={toggleDrawer}
      />

      {/* Drawer Content */}
      <div
        className={`fixed top-0 right-0 w-64 h-full bg-white text-orange-600 shadow-lg z-50 p-6 transform transition-transform duration-300 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Menu</h2>
          <button onClick={toggleDrawer} className="text-2xl text-orange-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-col space-y-4 text-sm font-semibold">
          <a
            href="https://www.lockstop.co/lockstopinsider"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            LOCKSTOP INSIDER
          </a>
          <a
            href="https://www.lockstop.co/faqs"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            FAQ
          </a>
          <a
            href="https://www.lockstop.co/blog"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            BLOG
          </a>
          <button
            onClick={handleLogout}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded transition w-full text-left"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
