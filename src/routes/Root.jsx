import { Outlet, Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { CiSettings } from "react-icons/ci";
import "../App.css"

export default function Root() {
  return (
    <>
      <nav className="navbar">
        <ul>
          <li><Link to="/"><FaHome /> Home</Link></li>
          <li><Link to="/settings"><CiSettings /> Settings</Link></li>
        </ul>
      </nav>
      
      <main>
        <Outlet />
      </main>
    </>
  );
}