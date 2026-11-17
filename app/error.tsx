"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-semibold">Something went wrong</h1>
      <p className="mt-3 text-roast">This page couldn’t load. Try again, and if it keeps happening, reload the site.</p>
      <button type="button" onClick={() => retry()} className="btn btn-gold mt-8">
        Try again
      </button>
    </div>
  );
}
