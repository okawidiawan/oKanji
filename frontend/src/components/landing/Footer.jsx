import { Link as RouterLink } from "react-router";
import { FaInstagram } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { SiWhatsapp } from "react-icons/si";

import logoImg from "../../assets/logo.svg";

/**
 * Komponen Footer
 * Menampilkan footer di bagian bawah halaman dengan informasi hak cipta,
 * tautan navigasi, tombol CTA (Let's Begin), dan ikon media sosial.
 */
export default function Footer() {
  return (
    <footer className="flex flex-col md:flex-row justify-between items-start w-full max-w-7xl mx-auto mt-16 md:mt-24 mb-24 gap-16 md:gap-0 px-4 border-t pt-8 border-my-border">
      <div className="left-side w-full md:w-1/4 gap-2 flex flex-col">
        <RouterLink>
          <img src={logoImg} alt="okanji Logo" className="h-10 w-auto" />
        </RouterLink>
        <p className="font-bold text-lg">
          Copyright <span className="text-primary text-xl">©</span> 2026
        </p>
        <p className="text-secondary-dark">
          Learn smarter,
          <br />
          Remember longer.
        </p>
      </div>

      <div className="right-side flex flex-col items-center w-full gap-12">
        <div className="bottom-nav flex flex-col md:grid md:grid-cols-3 gap-12 w-full">
          <ul className="flex flex-col gap-4">
            <li className="border-l-2 border-primary pl-4 text-secondary hover:text-primary cursor-pointer transition-colors">Home</li>
            <li className="border-l-2 border-primary pl-4 text-secondary hover:text-primary cursor-pointer transition-colors">Contact Us</li>
          </ul>
          <ul className="flex flex-col gap-4">
            <li className="border-l-2 border-primary pl-4 text-secondary hover:text-primary cursor-pointer transition-colors">Login</li>
            <li className="border-l-2 border-primary pl-4 text-secondary hover:text-primary cursor-pointer transition-colors">Register</li>
          </ul>
          <div className="flex items-center justify-end">
            <RouterLink to="/auth/login" className="text-lg bg-primary text-center px-6 py-3 rounded-md font-semibold transition-all duration-500 hover:bg-primary-dark ">
              Let's Begin
            </RouterLink>
          </div>
        </div>
        <hr className="border-t border-my-border/40 w-full" />
        <div className="social-media w-full">
          <ul className="flex justify-end gap-4">
            <li>
              <RouterLink to={"https://www.instagram.com/"} target="_blank">
                <FaInstagram className="text-2xl text-primary" />
              </RouterLink>
            </li>
            <li>
              <RouterLink to={"https://x.com/"} target="_blank">
                <FaTwitter className="text-2xl text-primary" />
              </RouterLink>
            </li>
            <li>
              <RouterLink to={"https://www.facebook.com/"} target="_blank">
                <FaFacebookF className="text-2xl text-primary" />
              </RouterLink>
            </li>
            <li>
              <RouterLink to={"https://mail.google.com/"} target="_blank">
                <HiOutlineMail className="text-2xl text-primary" />
              </RouterLink>
            </li>
            <li>
              <RouterLink to={"https://web.whatsapp.com/"} target="_blank">
                <SiWhatsapp className="text-2xl text-primary" />
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
