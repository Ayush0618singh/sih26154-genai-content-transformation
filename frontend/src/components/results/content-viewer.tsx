import type {
  ReactNode,
} from "react";

import {
  Braces,
  CheckCircle2,
  ListTree,
} from "lucide-react";

import {
  humanize,
} from "@/lib/utils/format";


function renderPrimitive(
  value:
    string | number | boolean
) {
  if (
    typeof value ===
    "boolean"
  ) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium">
        <CheckCircle2 className="size-4 text-primary" />

        {value
          ? "Yes"
          : "No"}
      </div>
    );
  }


  return (
    <p
      className={[
        "whitespace-pre-wrap",
        "break-words",

        "text-sm",
        "leading-7",
        "text-foreground/90",
      ].join(" ")}
    >
      {String(
        value
      )}
    </p>
  );
}


function renderValue(
  value: unknown,
  path: string,
  depth = 0
): ReactNode {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }


  if (
    typeof value ===
      "string" ||
    typeof value ===
      "number" ||
    typeof value ===
      "boolean"
  ) {
    return renderPrimitive(
      value
    );
  }


  if (
    Array.isArray(
      value
    )
  ) {
    if (
      value.length ===
      0
    ) {
      return (
        <p className="text-sm text-muted-foreground">
          No items available.
        </p>
      );
    }


    const primitiveArray =
      value.every(
        (
          item
        ) =>
          typeof item ===
            "string" ||
          typeof item ===
            "number" ||
          typeof item ===
            "boolean"
      );


    if (
      primitiveArray
    ) {
      return (
        <div className="space-y-2.5">
          {value.map(
            (
              item,
              index
            ) => (
              <div
                key={`${path}-${index}`}
                className={[
                  "flex",
                  "items-start",
                  "gap-3",

                  "rounded-xl",

                  "border",
                  "border-border/60",

                  "bg-background/45",

                  "px-4",
                  "py-3",
                ].join(" ")}
              >
                <span
                  className={[
                    "mt-[7px]",
                    "size-1.5",
                    "shrink-0",

                    "rounded-full",

                    "bg-primary",

                    "shadow-[0_0_8px_var(--primary)]",
                  ].join(" ")}
                />

                <div className="min-w-0 flex-1">
                  {renderValue(
                    item,
                    `${path}-${index}`,
                    depth +
                      1
                  )}
                </div>
              </div>
            )
          )}
        </div>
      );
    }


    return (
      <div className="space-y-3">
        {value.map(
          (
            item,
            index
          ) => (
            <div
              key={`${path}-${index}`}
              className={[
                "relative",
                "overflow-hidden",

                "rounded-2xl",

                "border",
                "border-border/70",

                "bg-muted/15",

                "p-4",

                "sm:p-5",
              ].join(" ")}
            >
              <div
                className={[
                  "mb-4",
                  "flex",
                  "items-center",
                  "gap-2",

                  "text-[10px]",
                  "font-bold",
                  "uppercase",
                  "tracking-[0.1em]",
                  "text-primary",
                ].join(" ")}
              >
                <ListTree className="size-3.5" />

                Item{" "}
                {index +
                  1}
              </div>

              {renderValue(
                item,
                `${path}-${index}`,
                depth +
                  1
              )}
            </div>
          )
        )}
      </div>
    );
  }


  if (
    typeof value ===
    "object"
  ) {
    const entries =
      Object.entries(
        value as Record<
          string,
          unknown
        >
      ).filter(
        (
          [
            ,
            nestedValue,
          ]
        ) =>
          nestedValue !==
            null &&
          nestedValue !==
            undefined &&
          nestedValue !==
            ""
      );


    if (
      !entries.length
    ) {
      return (
        <p className="text-sm text-muted-foreground">
          No structured data available.
        </p>
      );
    }


    return (
      <div
        className={
          depth === 0
            ? "space-y-5"
            : "space-y-4"
        }
      >
        {entries.map(
          (
            [
              key,
              nestedValue,
            ]
          ) => (
            <section
              key={`${path}-${key}`}
              className={
                depth ===
                0
                  ? [
                      "rounded-2xl",

                      "border",
                      "border-border/65",

                      "bg-background/35",

                      "p-5",
                    ].join(
                      " "
                    )
                  : ""
              }
            >
              <div
                className={[
                  "mb-3",
                  "flex",
                  "items-center",
                  "gap-2",
                ].join(" ")}
              >
                {depth ===
                  0 && (
                  <span
                    className={[
                      "flex",
                      "size-7",
                      "shrink-0",
                      "items-center",
                      "justify-center",

                      "rounded-lg",

                      "border",
                      "border-primary/20",

                      "bg-primary/8",
                      "text-primary",
                    ].join(" ")}
                  >
                    <Braces className="size-3.5" />
                  </span>
                )}

                <h4
                  className={[
                    depth ===
                    0
                      ? "text-sm"
                      : "text-xs",

                    "font-semibold",
                    "tracking-[-0.01em]",
                  ].join(" ")}
                >
                  {humanize(
                    key
                  )}
                </h4>
              </div>


              <div
                className={
                  depth ===
                  0
                    ? "pl-0 sm:pl-9"
                    : ""
                }
              >
                {renderValue(
                  nestedValue,
                  `${path}-${key}`,
                  depth +
                    1
                )}
              </div>
            </section>
          )
        )}
      </div>
    );
  }


  return (
    <p className="text-sm text-foreground/90">
      {String(
        value
      )}
    </p>
  );
}


interface ContentViewerProps {
  content: Record<
    string,
    unknown
  >;
}


export function ContentViewer({
  content,
}: ContentViewerProps) {
  const hasContent =
    Object.keys(
      content
    ).length >
    0;


  if (
    !hasContent
  ) {
    return (
      <div
        className={[
          "rounded-2xl",

          "border",
          "border-dashed",
          "border-border",

          "bg-muted/15",

          "px-5",
          "py-14",

          "text-center",
        ].join(" ")}
      >
        <Braces className="mx-auto size-6 text-primary" />

        <h3 className="mt-3 text-sm font-semibold">
          No content available
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          This generated output does not contain renderable content.
        </p>
      </div>
    );
  }


  return (
    <div className="min-w-0">
      {renderValue(
        content,
        "root",
        0
      )}
    </div>
  );
}