import type {
  MetadataRoute,
} from "next";


export default function manifest():
  MetadataRoute.Manifest {
  return {
    name:
      "TransformAI",

    short_name:
      "TransformAI",

    description:
      "GenAI Platform for Automated Content Transformation",

    start_url:
      "/",

    display:
      "standalone",

    background_color:
      "#ffffff",

    theme_color:
      "#111827",

    categories: [
      "productivity",
      "business",
      "utilities",
    ],
  };
}