"use client";

import { useCallback, useState } from "react";
import Preloader from "./Preloader";

export default function AppLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  const handleComplete = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <>
      {loading && (
        <Preloader onComplete={handleComplete} />
      )}

      {children}
    </>
  );
}