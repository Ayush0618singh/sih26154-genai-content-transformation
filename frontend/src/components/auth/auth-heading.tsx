interface AuthHeadingProps {
  title: string;
  description: string;
}

export function AuthHeading({
  title,
  description,
}: AuthHeadingProps) {
  return (
    <div className="mb-7 space-y-2">
      <h2 className="text-3xl font-bold tracking-tight">
        {title}
      </h2>

      <p className="text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}