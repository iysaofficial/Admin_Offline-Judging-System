"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebarcomp";
import Navbar from "@/components/navbarcomp";
import AddAssessmentComp from "@/components/assesment/addassesmentcomp";

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

export default function AddAssessment() {
  const [currentPage, setCurrentPage] = useState<PageKey>("/addassessment");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="admin-wrapper">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
      />

      <div className={`main-content ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="content-area p-4">
          <AddAssessmentComp />
        </div>
      </div>
    </div>
  );
}
