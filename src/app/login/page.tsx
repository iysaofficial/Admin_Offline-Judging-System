import Head from "next/head";
import type { NextPage } from "next";
import Login from "@/components/logincomp";

const LoginPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content="Judges Form Page" />
      </Head>
      <Login />
    </>
  );
};

export default LoginPage;
