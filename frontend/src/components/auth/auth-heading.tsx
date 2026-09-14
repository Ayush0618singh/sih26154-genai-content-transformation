import {
  Sparkles,
} from "lucide-react";


interface AuthHeadingProps {
  title: string;

  description: string;
}


export function AuthHeading({
  title,
  description,
}: AuthHeadingProps) {
  return (
    <div className="mb-7">
      <div className="premium-kicker mb-4">
        <Sparkles className="size-3.5" />

        TransformAI Workspace
      </div>

      <h1
        className={[
          "text-3xl",
          "font-bold",
          "tracking-[-0.04em]",
          "text-foreground",

          "sm:text-[2rem]",
        ].join(" ")}
      >
        {title}
      </h1>

      <p
        className={[
          "mt-3",
          "max-w-md",
          "text-sm",
          "leading-6",
          "text-muted-foreground",
        ].join(" ")}
      >
        {description}
      </p>
    </div>
  );
}