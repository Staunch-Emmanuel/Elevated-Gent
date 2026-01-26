// src/app/subscribe/success/page.tsx

import { Suspense } from "react";
import SubscribeSuccessClient from "./SubscribeSuccessClient";

export default function SubscribeSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-6">
          Loading...
        </div>
      }
    >
      <SubscribeSuccessClient />
    </Suspense>
  );
}
