"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/sidebarcomp";
import Navbar from "@/components/navbarcomp";
import Head from "next/head";
import EditUserComp from "@/components/user/editusercomp";
import { supabase } from "@/lib/supabaseClient";

const EditUserPage = () => {
  const router = useRouter();
  const params = useParams(); // ambil id dari URL
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!params?.id) return;

      const { data, error } = await supabase
        .from("judges")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUserData(data);
      }

      setLoading(false);
    };

    fetchUser();
  }, [params]);

  if (loading) return <p className="p-4">Loading user data...</p>;

  return (
    <>
      <Head>
        <title>Edit User</title>
      </Head>

      <div className="admin-wrapper">
        <Sidebar
          sidebarOpen={true}
          setCurrentPage={() => {}}
          currentPage="/listuser"
        />

        <div className="main-content sidebar-open">
          <Navbar sidebarOpen={true} setSidebarOpen={() => {}} />
          <div className="content-area p-4">
            <EditUserComp user={userData} />
          </div>
        </div>
      </div>
    </>
  );
};

export default EditUserPage;
