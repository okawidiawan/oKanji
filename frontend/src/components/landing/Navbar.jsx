import { Link, NavLink } from "react-router";
import logoImg from "../../assets/logo.png";

export default function Navbar() {
  return (
    <div className="flex justify-center my-7 sticky top-7 z-50">
      <div className="navbar flex flex-row justify-around w-7xl h-16 items-center rounded-full border border-my-border bg-transparent backdrop-blur-md top-0 shadow-[0_8px_8px_rgba(0,0,0,0.4)]">
        <Link to="/" className="logo">
          <img src={logoImg} alt="okanji Logo" className="h-10 w-auto" />
        </Link>
        <div className="nav">
          <ul className="flex gap-6">
            <li className="">
              <NavLink to="/" className="text-secondary">
                Home
              </NavLink>
            </li>
            <li className="">
              <NavLink to="/" className="text-secondary-dark">
                About
              </NavLink>
            </li>
            <li className="">
              <NavLink to="/" className="text-secondary-dark">
                Services
              </NavLink>
            </li>
          </ul>
        </div>
        <div className="btn-cta flex items-center">
          <div className="red-dot bg-primary w-2 h-2 mx-5 rounded-full"></div>
          <NavLink>Get Started</NavLink>
        </div>
      </div>
    </div>
  );
}
