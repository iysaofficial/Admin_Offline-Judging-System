"use client";

import { useState } from "react";
import Head from "next/head";
import type { NextPage } from "next";
import Sidebar from "@/components/sidebarcomp";
import Navbar from "@/components/navbarcomp";
import ListAssessmentComp from "@/components/assesment/listassessmentcomp";

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

const ListAssessmentPage: NextPage = () => {
  const [currentPage, setCurrentPage] = useState<PageKey>("/listassessment");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      {/* ✅ Head meta info untuk SEO dan tab title */}
      <Head>
        <title>List Assessment</title>
        <meta name="description" content="List of all assessment templates" />
      </Head>

      {/* ✅ Main layout structure */}
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
            <ListAssessmentComp />
          </div>
        </div>
      </div>
    </>
  );
};

export default ListAssessmentPage;
