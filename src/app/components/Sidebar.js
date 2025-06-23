import Link from 'next/link';
import '../styles/sidebar.css';
import { FaHome, FaUsers, FaChalkboardTeacher } from 'react-icons/fa';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">A</div>
      <nav className="sidebar-nav">
        <Link href="/" className="nav-item">
          <div className="nav-icon-container">
            <FaHome className="nav-icon" />
            <span className="nav-label">Home</span>
          </div>
        </Link>
        <Link href="/mentorship" className="nav-item">
          <div className="nav-icon-container">
            <FaUsers className="nav-icon" />
            <span className="nav-label">Mentoría</span>
          </div>
        </Link>
        <Link href="/coaches" className="nav-item">
          <div className="nav-icon-container">
            <FaChalkboardTeacher className="nav-icon" />
            <span className="nav-label">Coaches</span>
          </div>
        </Link>
      </nav>
    </div>
  );
}