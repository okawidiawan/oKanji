import { Link as RouterLink } from "react-router";
import { Link as ScrollLink } from "react-scroll";
import logoImg from "../../assets/logo.png";

export default function Navbar() {
  return (
    <header className="flex justify-center my-7 sticky top-7 z-50">
      <nav className="navbar flex flex-row justify-around w-7xl h-16 items-center rounded-full border border-my-border bg-transparent backdrop-blur-md top-0 shadow-[0_8px_8px_rgba(0,0,0,0.4)]">
        <RouterLink to="/" className="logo">
          <img src={logoImg} alt="okanji Logo" className="h-10 w-auto" />
        </RouterLink>
        <div className="nav">
          <ul className="flex gap-6">
            <li className="">
              <ScrollLink to="hero" className="text-secondary-dark cursor-pointer" activeClass="!text-secondary font-bold" spy={true} smooth={true} offset={-200} duration={500}>
                Home
              </ScrollLink>
            </li>
            <li className="">
              <ScrollLink to="cards" className="text-secondary-dark cursor-pointer" activeClass="!text-secondary font-bold" spy={true} smooth={true} offset={-240} duration={500}>
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
          <RouterLink>Get Started</RouterLink>
        </div>
      </nav>
    </header>
  );
}
