"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

let poolPromise: Promise<string[]> | undefined;
const loadPool = () => {
  poolPromise ??= fetch("/pool.json").then((r) => r.json() as Promise<string[]>);
  return poolPromise;
};

/** Opens a random essential or core word. The pool is fetched on first use. */
export function RandomButton({ className }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const last = useRef<string | null>(null);
  return (
    <button
      type="button"
      className={className}
      title="Open a random entry"
      aria-busy={busy}
      onPointerEnter={() => void loadPool()}
      onClick={async () => {
        setBusy(true);
        try {
          const pool = await loadPool();
          let id = pool[Math.floor(Math.random() * pool.length)];
          if (id === last.current && pool.length > 1)
            id = pool[(pool.indexOf(id) + 1) % pool.length];
          if (id) {
            last.current = id;
            router.push(`/${id}`);
          }
        } finally {
          setBusy(false);
        }
      }}
    >
      Random
    </button>
  );
}
