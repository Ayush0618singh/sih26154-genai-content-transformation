import {
  Sparkles,
} from "lucide-react";


export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <Sparkles className="size-6 animate-pulse" />
        </div>

        <p className="mt-5 text-sm font-semibold">
          Loading TransformAI
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          Preparing your workspace...
        </p>
      </div>
    </div>
  );
}