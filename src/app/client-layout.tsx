"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { LoadingOutlined } from '@ant-design/icons';
import { Flex, Spin } from 'antd';

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    const token = Cookies.get("auth_token");
    console.log('token is', token);

    if (token) {
      router.push("/event-details");
    }
    else {

      router.replace('/');
    }
    setLoading(false);

  }, [router]);

  return <>
    {loading ? (<div className="w-full h-full flex justify-center items-center">
      <Flex justify="center" align="center" style={{ height: "100vh" }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 80, color: "#ef4444" }} spin allowFullScreen={true} />} />
      </Flex>
    </div>) : (
      <div>
        <Navbar />
        <div className="mt-20">
          {children}
        </div>
        <Footer />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          toastClassName={() =>
            "w-[400px] md:w-[500px] bg-white shadow-lg rounded-lg p-4 text-black flex flex-row"
          }
        />
      </div >
    )
    }
  </>
}
