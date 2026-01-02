"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type PageKey =
  | "/dashboard"
  | "/adduser"
  | "/listuser"
  | "/addparticipants"
  | "/listparticipants"
  | "/addassessment"
  | "/listassessment"
  | "/assignjudges"
  | "/result"
  | "/userdetails"
  | "/useredit";
  

interface SidebarCompProps {
  sidebarOpen: boolean;
  currentPage: PageKey;
  setCurrentPage: React.Dispatch<React.SetStateAction<PageKey>>;
}

const SidebarComp: React.FC<SidebarCompProps> = ({
  sidebarOpen,
  currentPage,
  setCurrentPage,
}) => {
  const router = useRouter();

  // Dropdown states
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [participantsDropdownOpen, setParticipantsDropdownOpen] = useState(false);
  const [assessmentDropdownOpen, setAssessmentDropdownOpen] = useState(false);

  // Fungsi pindah halaman
  const handleNavigation = (key: PageKey) => {
    setCurrentPage(key);
    router.push(key);
  };

  useEffect(() => {
    if (currentPage === "/adduser" || currentPage === "/listuser" || currentPage === "/userdetails" || currentPage === "/useredit") {
      setUserDropdownOpen(true);
    } else if (currentPage === "/addparticipants" || currentPage === "/listparticipants") {
      setParticipantsDropdownOpen(true);
    } else if (currentPage === "/addassessment" || currentPage === "/listassessment") {
      setAssessmentDropdownOpen(true);
    }
  }, [currentPage]);

  // Fungsi logout dari code lama
  const handleLogout = () => {
    // 🧹 Hapus session (cookie & localStorage)
    document.cookie = "adminUser=; path=/; max-age=0;";
    localStorage.removeItem("adminUser");

    // 🔄 Redirect ke halaman login
    router.push("/login");
  };

  return (
    <div
      className={`sidebar bg-dark text-white ${sidebarOpen ? "open" : "closed"}`}
    >
      <div className="sidebar-header p-3 border-bottom border-secondary">
        <h4 className="mb-0">
          <i className="bi bi-speedometer2 me-2"></i> Admin Panel
        </h4>
      </div>

      <ul className="nav flex-column mt-3">
        {/* Dashboard */}
        <li className="nav-item">
          <a
            className={`nav-link text-white ${
              currentPage === "/dashboard" ? "active bg-primary" : ""
            }`}
            style={{ cursor: "pointer", padding: "10px 20px" }}
            onClick={() => handleNavigation("/dashboard")}
          >
            <i className="bi bi-house-door me-2"></i> Dashboard
          </a>
        </li>

        {/* USER Dropdown */}
        <li className="nav-item">
          <a
            className="nav-link text-white d-flex justify-content-between align-items-center"
            style={{ cursor: "pointer", padding: "10px 20px" }}
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          >
            <span>
              <i className="bi bi-people me-2"></i> User
            </span>
            <i
              className={`bi ${
                userDropdownOpen ? "bi-chevron-up" : "bi-chevron-down"
              }`}
            ></i>
          </a>

          {userDropdownOpen && (
            <ul className="nav flex-column ms-3">
              <li>
                <a
                  className={`nav-link text-white ${
                    currentPage === "/adduser" ? "active bg-primary" : ""
                  }`}
                  style={{ cursor: "pointer", padding: "8px 20px" }}
                  onClick={() => handleNavigation("/adduser")}
                >
                  <i className="bi bi-person-plus me-2"></i> Add User
                </a>
              </li>
              <li>
                <a
                  className={`nav-link text-white ${
                    currentPage === "/listuser" ? "active bg-primary" : ""
                  }`}
                  style={{ cursor: "pointer", padding: "8px 20px" }}
                  onClick={() => handleNavigation("/listuser")}
                >
                  <i className="bi bi-list-ul me-2"></i> List User
                </a>
              </li>
            </ul>
          )}
        </li>

        {/* Participants Dropdown */}
        <li className="nav-item">
          <a
            className="nav-link text-white d-flex justify-content-between align-items-center"
            style={{ cursor: "pointer", padding: "10px 20px" }}
            onClick={() => setParticipantsDropdownOpen(!participantsDropdownOpen)}
          >
            <span>
              <i className="bi bi-file-earmark-text me-2"></i> Participants
            </span>
            <i
              className={`bi ${
                participantsDropdownOpen ? "bi-chevron-up" : "bi-chevron-down"
              }`}
            ></i>
          </a>

          {participantsDropdownOpen && (
            <ul className="nav flex-column ms-3">
              <li>
                <a
                  className={`nav-link text-white ${
                    currentPage === "/addparticipants" ? "active bg-primary" : ""
                  }`}
                  style={{ cursor: "pointer", padding: "8px 20px" }}
                  onClick={() => handleNavigation("/addparticipants")}
                >
                  <i className="bi bi-file-earmark-plus me-2"></i> Add Participants
                </a>
              </li>
              <li>
                <a
                  className={`nav-link text-white ${
                    currentPage === "/listparticipants" ? "active bg-primary" : ""
                  }`}
                  style={{ cursor: "pointer", padding: "8px 20px" }}
                  onClick={() => handleNavigation("/listparticipants")}
                >
                  <i className="bi bi-file-earmark-text me-2"></i> List Participants
                </a>
              </li>
            </ul>
          )}
        </li>

        {/* ASSESSMENT Dropdown */}
        <li className="nav-item">
          <a
            className="nav-link text-white d-flex justify-content-between align-items-center"
            style={{ cursor: "pointer", padding: "10px 20px" }}
            onClick={() => setAssessmentDropdownOpen(!assessmentDropdownOpen)}
          >
            <span>
              <i className="bi bi-file-earmark-text me-2"></i> Assessment
            </span>
            <i
              className={`bi ${
                assessmentDropdownOpen ? "bi-chevron-up" : "bi-chevron-down"
              }`}
            ></i>
          </a>

          {assessmentDropdownOpen && (
            <ul className="nav flex-column ms-3">
              <li>
                <a
                  className={`nav-link text-white ${
                    currentPage === "/addassessment" ? "active bg-primary" : ""
                  }`}
                  style={{ cursor: "pointer", padding: "8px 20px" }}
                  onClick={() => handleNavigation("/addassessment")}
                >
                  <i className="bi bi-file-earmark-plus me-2"></i> Add Assessment
                </a>
              </li>
              <li>
                <a
                  className={`nav-link text-white ${
                    currentPage === "/listassessment" ? "active bg-primary" : ""
                  }`}
                  style={{ cursor: "pointer", padding: "8px 20px" }}
                  onClick={() => handleNavigation("/listassessment")}
                >
                  <i className="bi bi-file-earmark-text me-2"></i> List Assessment
                </a>
              </li>
            </ul>
          )}
        </li>

        <li className="nav-item">
          <a
            className={`nav-link text-white ${
              currentPage === "/assignjudges" ? "active bg-primary" : ""
            }`}
            style={{ cursor: "pointer", padding: "10px 20px" }}
            onClick={() => handleNavigation("/assignjudges")}
          >
            <i className="bi bi-clipboard-data me-2"></i> Assign Judges
          </a>
        </li>

        {/* RESULT */}
        <li className="nav-item">
          <a
            className={`nav-link text-white ${
              currentPage === "/result" ? "active bg-primary" : ""
            }`}
            style={{ cursor: "pointer", padding: "10px 20px" }}
            onClick={() => handleNavigation("/result")}
          >
            <i className="bi bi-clipboard-data me-2"></i> Result
          </a>
        </li>

        
      </ul>

      {/* Bottom Section */}
      <div className="mt-auto p-3 border-top border-secondary">
        <div className="d-flex align-items-center mb-2">
          <i className="bi bi-person-circle fs-4 me-2"></i>
          <div>
            <div className="fw-bold small">Admin User</div>
            <small className="text-muted">Administrator</small>
          </div>
        </div>

        {/* ✅ Logout pakai versi lama (hapus session + redirect) */}
        <button
          className="btn btn-outline-light btn-sm w-100"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-2"></i> Logout
        </button>
      </div>
    </div>
  );
};

export default SidebarComp;
