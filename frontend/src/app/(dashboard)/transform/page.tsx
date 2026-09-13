import type {
  Metadata,
} from "next";

import {
  TransformStudio,
} from "@/components/transform/transform-studio";


export const metadata: Metadata = {
  title:
    "Transform Studio",
};


export default function TransformPage() {
  return (
    <TransformStudio />
  );
}