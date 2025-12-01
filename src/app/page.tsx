"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";

const HomeRedirect: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return null;
};

export default HomeRedirect;
