"use client";

import SignInForm from "@/components/SignInForm";

export default function Home() {
  

  return (
    <>
      <div className="flex flex-col">
        <main className=" pt-[70px] pb-[70px] bg-gray-100 px-4">
        <SignInForm/>
        </main>    
      </div>

      
    </>
  );
}