"use client";

import React from "react";
import ThreePreloader from "../../components/ThreePreloader";

export default function PreloaderPage() {
  return (
    <main className="w-screen h-screen overflow-hidden">
      <ThreePreloader targetUrl="/dashboard" autoEnter={false} />
    </main>
  );
}
