"use client";

import dynamic from "next/dynamic";

const DropPinClient = dynamic(() => import("./DropPinClient"), {
  ssr: false,
});

export default function DropPinPage() {
  return <DropPinClient />;
}
