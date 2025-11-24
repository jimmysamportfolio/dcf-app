"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  return (
    <main>
      <div className="hero min-h-screen">
        <div className="hero-content flex flex-col items-center text-center">
          <div className="relative z-5 -mt-32 mb-6">
            <div className="hover-3d">
              {/* content */}
              <figure className="max-w-100 rounded-2xl">
                <img
                  src="/Gemini_Generated_Image_9k4b109k4b109k4b-removebg-preview.png"
                  alt="3D logo"
                />
              </figure>
              {/* 8 empty divs needed for the 3D effect */}
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
          <div className="max-w-md relative -mt-32 z-10">
            <h1 className="text-5xl font-bold">Valuation Lab</h1>
            <p className="py-6">This app will blow your mind.</p>
            <button
              onClick={() => router.push("/create")}
              className="btn btn-secondary"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
