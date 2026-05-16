import { Link as RouterLink } from "react-router";
import { Link as ScrollLink } from "react-scroll";
import logoImg from "../../assets/logo.svg";

export default function Navbar() {
  return (
    <header className="relative flex justify-center my-7 sm:sticky top-7 z-50">
      <nav className="hidden sm:flex navbar flex-row justify-around w-[95%] max-w-7xl px-4 md:px-8 h-16 items-center rounded-full border border-my-border bg-transparent backdrop-blur-md top-0 shadow-[0_8px_8px_rgba(0,0,0,0.4)]">
        <RouterLink to="/" className="logo">
          <img src={logoImg} alt="okanji Logo" className="h-10 w-auto" />
        </RouterLink>
        <div className="nav hidden md:block">
          <ul className="flex gap-6">
            <li className="">
              <ScrollLink to="hero" className="text-secondary-dark cursor-pointer" activeClass="!text-secondary font-bold" spy={true} smooth={true} offset={-200} duration={500}>
                Home
              </ScrollLink>
            </li>
            <li className="">
              <ScrollLink to="cards" className="text-secondary-dark cursor-pointer" activeClass="!text-secondary font-bold" spy={true} smooth={true} offset={-200} duration={500}>
                Services
              </ScrollLink>
            </li>
            <li className="">
              <ScrollLink to="features" className="text-secondary-dark cursor-pointer" activeClass="!text-secondary font-bold" spy={true} smooth={true} offset={-200} duration={500}>
                Features
              </ScrollLink>
            </li>
            <li className="">
              <ScrollLink to="about" className="text-secondary-dark cursor-pointer" activeClass="!text-secondary font-bold" spy={true} smooth={true} offset={-200} duration={500}>
                About
              </ScrollLink>
            </li>
          </ul>
        </div>
        <div className="btn-cta flex items-center">
          <div className="red-dot bg-primary w-2 h-2 mx-5 rounded-full"></div>
          <RouterLink to="/auth/login">Get Started</RouterLink>
        </div>
      </nav>

      <nav className="sm:hidden fixed bottom-0 flex navbar flex-row justify-around w-[95%] max-w-7xl px-4 md:px-8 h-16 items-center rounded-full border border-my-border bg-transparent backdrop-blur-md shadow-[0_8px_8px_rgba(0,0,0,0.4)]">
        <div className="nav hidden md:block">
          <ul className="flex gap-6">
            <li className="">
              <ScrollLink to="hero" className="text-secondary-dark cursor-pointer" activeClass="!text-secondary font-bold" spy={true} smooth={true} offset={-200} duration={500}>
                Home
              </ScrollLink>
            </li>
            <li className="">
              <ScrollLink to="cards" className="text-secondary-dark cursor-pointer" activeClass="!text-secondary font-bold" spy={true} smooth={true} offset={-200} duration={500}>
                Services
              </ScrollLink>
            </li>
            <li className="">
              <ScrollLink to="features" className="text-secondary-dark cursor-pointer" activeClass="!text-secondary font-bold" spy={true} smooth={true} offset={-200} duration={500}>
                Features
              </ScrollLink>
            </li>
            <li className="">
              <ScrollLink to="about" className="text-secondary-dark cursor-pointer" activeClass="!text-secondary font-bold" spy={true} smooth={true} offset={-200} duration={500}>
                About
              </ScrollLink>
            </li>
          </ul>
        </div>
        <div className="btn-cta flex items-center">
          <div className="red-dot bg-primary w-2 h-2 mx-5 rounded-full"></div>
          <RouterLink to="/auth/login">Get Started</RouterLink>
        </div>
      </nav>
    </header>
  );
}
