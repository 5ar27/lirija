import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import originalBody from "@/lib/lirija-body.html?raw";
import gownFrames from "@/assets/gown-smooth-frames.asset.json";
import { initializeLirija } from "@/lib/lirija-animation";
import { photoUrls } from "@/lib/lirija-photos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lirija Venčanice" },
      { name: "description", content: "Salon venčanica Lirija, Beograd. Kolekcije Selestia Paris, Albina Dyla i Vladiyan, privatne probe i prepravke po meri." },
      { property: "og:title", content: "Lirija Venčanice" },
      { property: "og:description", content: "Salon venčanica Lirija, Beograd. Kolekcije Selestia Paris, Albina Dyla i Vladiyan, privatne probe i prepravke po meri." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const frameUrls = gownFrames.map((asset) => asset.url);
const body = originalBody
  .replace("__GOWN_POSTER__", frameUrls[0] ?? "")
  .replace(/__PHOTO_\d+__/g, (placeholder) => photoUrls[placeholder] ?? placeholder);

function Index() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const script = document.createElement("script");
    script.src = "/lenis.min.js";
    const initialize = () => {
      if (!cancelled) cleanup = initializeLirija(frameUrls);
    };
    script.onload = initialize;
    script.onerror = initialize;
    document.head.appendChild(script);
    return () => {
      cancelled = true;
      cleanup?.();
      script.remove();
    };
  }, []);

  return (
    <div dangerouslySetInnerHTML={{ __html: body }} />
  );
}
