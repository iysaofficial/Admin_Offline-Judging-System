"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebarcomp";
import Navbar from "@/components/navbarcomp";
import Head from "next/head";
import type { NextPage } from "next";
import ListUserComp from "@/components/user/listusercomp";

// Samakan dengan PageKey utama di dashboard
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

const ListUserPage: NextPage = () => {
  const [currentPage, setCurrentPage] = useState<PageKey>("/listuser");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <>
      <Head>
        <title>List User</title>
        <meta name="description" content="Judges List Page" />
      </Head>
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
            <ListUserComp />
          </div>
        </div>
      </div>
    </>
  );
};

export default ListUserPage;
