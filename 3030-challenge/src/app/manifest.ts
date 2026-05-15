import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "30/30 Challenge",
    short_name: "30/30",
    description: "A privacy-safe digital fitness challenge workbook.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#a3e635",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
