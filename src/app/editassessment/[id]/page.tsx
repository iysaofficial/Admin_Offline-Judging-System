"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebarcomp";
import Navbar from "@/components/navbarcomp";
import UpdateAssessmentComp from "@/components/assesment/editassessmentcomp"; // ✅ pakai folder kamu

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

export default function EditAssessmentPage() {
  const [currentPage, setCurrentPage] = useState<PageKey>("/listassessment");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="admin-wrapper">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
      />

      <div
        className={`main-content ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="content-area p-4">
          <UpdateAssessmentComp /> {/* ✅ tampilkan komponen edit */}
        </div>
      </div>
    </div>
  );
}
