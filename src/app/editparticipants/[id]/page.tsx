"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebarcomp";
import Navbar from "@/components/navbarcomp";
import Head from "next/head";
import EditParticipantsComp from "@/components/participants/editparticipantscomp";

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

export default function EditParticipantPage() {
  const [currentPage, setCurrentPage] =
    useState<PageKey>("/listparticipants");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <Head>
        <title>Edit Participant</title>
        <meta name="description" content="Edit Participant Page" />
      </Head>

      <div className="admin-wrapper">
        {/* SIDEBAR */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />

        {/* MAIN CONTENT */}
        <div
          className={`main-content ${
            sidebarOpen ? "sidebar-open" : "sidebar-closed"
          }`}
        >
          <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <div className="content-area p-4">
            <EditParticipantsComp />
          </div>
        </div>
      </div>
    </>
  );
}
