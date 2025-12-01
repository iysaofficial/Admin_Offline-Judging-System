"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebarcomp";
import Navbar from "@/components/navbarcomp";
import Head from "next/head";
import type { NextPage } from "next";
import AddParticipantsComp from "@/components/participants/addparticipants";

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

const AddUserPage: NextPage = () => {
  const [currentPage, setCurrentPage] = useState<PageKey>("/addparticipants");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <Head>
        <title>Add User</title>
        <meta name="description" content="Judges Form Page" />
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
            <AddParticipantsComp />
          </div>
        </div>
      </div>
    </>
  );
};

export default AddUserPage;
