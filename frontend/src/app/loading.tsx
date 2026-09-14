import {
  BrainCircuit,
  Sparkles,
} from "lucide-react";


export default function Loading() {
  return (
    <div
      className={[
        "premium-page",

        "flex",
        "min-h-screen",
        "items-center",
        "justify-center",

        "overflow-hidden",

        "bg-background",

        "px-5",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[110px]" />


      <div className="relative text-center">
        <div
          className={[
            "relative",

            "mx-auto",

            "flex",
            "size-16",
            "items-center",
            "justify-center",

            "rounded-2xl",

            "border",
            "border-primary/30",

            "bg-primary",
            "text-primary-foreground",

            "shadow-[0_18px_55px_-24px_var(--primary)]",
          ].join(" ")}
        >
          <BrainCircuit className="size-7 animate-pulse" />

          <span
            className={[
              "absolute",
              "inset-0",
              "-z-10",

              "animate-ping",

              "rounded-2xl",

              "bg-primary/20",
            ].join(" ")}
          />
        </div>


        <div className="mt-6 flex items-center justify-center gap-2">
          <Sparkles className="size-3.5 text-primary" />

          <span
            className={[
              "text-[10px]",
              "font-bold",
              "uppercase",
              "tracking-[0.16em]",
              "text-primary",
            ].join(" ")}
          >
            TransformAI
          </span>
        </div>


        <h1 className="mt-3 text-lg font-semibold tracking-[-0.025em]">
          Preparing your workspace
        </h1>


        <p className="mt-2 text-xs text-muted-foreground">
          Loading secure content intelligence services...
        </p>


        <div
          className={[
            "mx-auto",
            "mt-6",

            "h-1",
            "w-44",

            "overflow-hidden",

            "rounded-full",

            "bg-muted",
          ].join(" ")}
        >
          <div
            className={[
              "h-full",
              "w-1/2",

              "animate-pulse",

              "rounded-full",

              "bg-primary",
            ].join(" ")}
          />
        </div>
      </div>
    </div>
  );
}