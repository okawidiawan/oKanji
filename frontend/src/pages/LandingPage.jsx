import { Link, NavLink } from "react-router";
import logoImg from "../assets/logo.png";

export default function LandingPage() {
  return (
    <div className="flex justify-center">
      <div className="navbar flex flex-row bg-background-lighter justify-around mt-7 w-7xl h-16 items-center rounded-full">
        <Link to="/" className="logo">
          <img src={logoImg} alt="okanji Logo" className="h-10 w-auto" />
        </Link>
        <div className="nav ">
          <ul className="flex ">
            <li className="mx-5">
              <NavLink to="/" className="text-secondary">
                Home
              </NavLink>
            </li>
            <li className="mx-5">
              <NavLink to="/" className="text-secondary-dark">
                About
              </NavLink>
            </li>
            <li className="mx-5">
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
