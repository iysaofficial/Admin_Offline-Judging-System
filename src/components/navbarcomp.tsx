import React from "react";

interface NavbarCompProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavbarComp: React.FC<NavbarCompProps> = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div className="container-fluid">
        <button
          className="btn btn-outline-secondary me-3"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <i className="bi bi-list fs-5"></i>
        </button>
        <span className="navbar-brand mb-0 h4">Admin Dashboard</span>
        <div className="ms-auto d-flex align-items-center">
          <i className="bi bi-bell me-3 fs-5 text-muted"></i>
          <i className="bi bi-person-circle fs-4 text-primary"></i>
        </div>
      </div>
    </nav>
  );
};

export default NavbarComp;
