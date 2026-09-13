import type {
  ReactNode,
} from "react";

import {
  humanize,
} from "@/lib/utils/format";


function renderValue(
  value: unknown,
  path: string
): ReactNode {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }


  if (
    typeof value ===
      "string" ||
    typeof value ===
      "number"
  ) {
    return (
      <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/90">
        {String(
          value
        )}
      </p>
    );
  }


  if (
    typeof value ===
    "boolean"
  ) {
    return (
      <p className="text-sm">
        {value
          ? "Yes"
          : "No"}
      </p>
    );
  }


  if (
    Array.isArray(
      value
    )
  ) {
    return (
      <div className="space-y-3">
        {value.map(
          (
            item,
            index
          ) => (
            <div
              key={`${path}-${index}`}
              className="rounded-xl border bg-muted/20 p-4"
            >
              {renderValue(
                item,
                `${path}-${index}`
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
    return (
      <div className="space-y-5">
        {Object.entries(
          value as Record<
            string,
            unknown
          >
        ).map(
          (
            [
              key,
              nestedValue,
            ]
          ) => {
            if (
              nestedValue ===
                null ||
              nestedValue ===
                undefined ||
              nestedValue ===
                ""
            ) {
              return null;
            }

            return (
              <section
                key={`${path}-${key}`}
              >
                <h4 className="mb-2 text-sm font-semibold">
                  {humanize(
                    key
                  )}
                </h4>

                {renderValue(
                  nestedValue,
                  `${path}-${key}`
                )}
              </section>
            );
          }
        )}
      </div>
    );
  }


  return (
    <p className="text-sm">
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
  return (
    <div>
      {renderValue(
        content,
        "root"
      )}
    </div>
  );
}