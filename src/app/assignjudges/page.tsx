"use client";

import { useState } from "react";
import Head from "next/head";
import Sidebar from "@/components/sidebarcomp";
import Navbar from "@/components/navbarcomp";
import AssignJudgesComp from "@/components/judges/assignjudgescomp";

type PageKey =
  | "/dashboard"
  | "/adduser"
  | "/listuser"
  | "/addparticipants"
  | "/listparticipants"
  | "/addassessment"
  | "/listassessment"
  | "/result"
  | "/userdetails"
  | "/useredit"
  | "/assignjudges";

export default function AssignJudgesPage() {
  const [currentPage, setCurrentPage] = useState<PageKey>("/assignjudges");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <Head>
        <title>Assign Judges</title>
      </Head>

      <div className="admin-wrapper">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />

        <div className={`main-content ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
          <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="content-area p-4">
            <AssignJudgesComp />
          </div>
        </div>
      </div>
    </>
  );
}
