"use client";

import {
  useCallback,
} from "react";

import {
  FileImage,
  FileSpreadsheet,
  FileText,
  Film,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";

import {
  useDropzone,
} from "react-dropzone";

import {
  Button,
} from "@/components/ui/button";

import {
  cn,
} from "@/lib/utils";

import {
  formatBytes,
} from "@/lib/utils/format";


const MAX_FILE_SIZE =
  50 * 1024 * 1024;


interface SourceInputProps {
  file:
    File | null;

  disabled?: boolean;

  onFileChange:
    (
      file:
        File | null
    ) => void;

  onRejected:
    (
      message:
        string
    ) => void;
}


function getExtension(
  filename:
    string
) {
  return (
    filename
      .split(".")
      .pop()
      ?.toLowerCase() ??
    ""
  );
}


function FileIcon({
  filename,
}: {
  filename:
    string;
}) {
  const extension =
    getExtension(
      filename
    );


  if (
    [
      "mp4",
      "mov",
      "webm",
    ].includes(
      extension
    )
  ) {
    return (
      <Film className="size-6" />
    );
  }


  if (
    [
      "png",
      "jpg",
      "jpeg",
      "webp",
      "bmp",
      "tif",
      "tiff",
    ].includes(
      extension
    )
  ) {
    return (
      <FileImage className="size-6" />
    );
  }


  if (
    [
      "csv",
      "xlsx",
      "json",
    ].includes(
      extension
    )
  ) {
    return (
      <FileSpreadsheet className="size-6" />
    );
  }


  return (
    <FileText className="size-6" />
  );
}


function fileTypeLabel(
  filename:
    string
) {
  const extension =
    getExtension(
      filename
    );

  return extension
    ? extension.toUpperCase()
    : "FILE";
}


export function SourceInput({
  file,
  disabled = false,
  onFileChange,
  onRejected,
}: SourceInputProps) {
  const onDrop =
    useCallback(
      (
        acceptedFiles:
          File[]
      ) => {
        if (
          acceptedFiles[0]
        ) {
          onFileChange(
            acceptedFiles[0]
          );
        }
      },

      [
        onFileChange,
      ]
    );


  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,

    disabled,

    maxFiles:
      1,

    maxSize:
      MAX_FILE_SIZE,

    accept: {
      "application/pdf": [
        ".pdf",
      ],

      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [
          ".docx",
        ],

      "text/plain": [
        ".txt",
        ".md",
      ],

      "application/json": [
        ".json",
      ],

      "text/csv": [
        ".csv",
      ],

      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        [
          ".xlsx",
        ],

      "image/*": [
        ".png",
        ".jpg",
        ".jpeg",
        ".webp",
        ".bmp",
        ".tif",
        ".tiff",
      ],

      "video/mp4": [
        ".mp4",
      ],

      "video/quicktime": [
        ".mov",
      ],

      "video/webm": [
        ".webm",
      ],
    },

    onDropRejected:
      (
        rejections
      ) => {
        const first =
          rejections[0];

        const error =
          first?.errors[0];


        if (
          error?.code ===
          "file-too-large"
        ) {
          onRejected(
            "File exceeds the 50 MB upload limit."
          );

          return;
        }


        onRejected(
          error?.message ??
            "Unsupported file."
        );
      },
  });


  if (file) {
    return (
      <div
        className={[
          "group",
          "relative",
          "overflow-hidden",

          "rounded-2xl",

          "border",
          "border-primary/20",

          "bg-gradient-to-br",
          "from-primary/8",
          "via-card",
          "to-card",

          "p-4",

          "shadow-[0_18px_55px_-42px_var(--primary)]",

          "sm:p-5",
        ].join(" ")}
      >
        <div
          className={[
            "pointer-events-none",
            "absolute",
            "-right-16",
            "-top-16",

            "size-36",

            "rounded-full",

            "bg-primary/12",
            "blur-3xl",
          ].join(" ")}
        />

        <div className="relative flex items-center gap-4">
          <div
            className={[
              "premium-icon-box",
              "flex",
              "size-12",
              "shrink-0",
              "items-center",
              "justify-center",

              "rounded-xl",
            ].join(" ")}
          >
            <FileIcon
              filename={
                file.name
              }
            />
          </div>


          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="max-w-full truncate text-sm font-semibold">
                {file.name}
              </p>

              <span
                className={[
                  "rounded-full",

                  "border",
                  "border-primary/20",

                  "bg-primary/8",

                  "px-2",
                  "py-0.5",

                  "text-[9px]",
                  "font-bold",
                  "tracking-[0.08em]",
                  "text-primary",
                ].join(" ")}
              >
                {fileTypeLabel(
                  file.name
                )}
              </span>
            </div>

            <div
              className={[
                "mt-1.5",
                "flex",
                "flex-wrap",
                "items-center",
                "gap-x-3",
                "gap-y-1",

                "text-[11px]",
                "text-muted-foreground",
              ].join(" ")}
            >
              <span>
                {formatBytes(
                  file.size
                )}
              </span>

              <span className="hidden sm:inline">
                •
              </span>

              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3 text-primary" />

                Ready for validation
              </span>
            </div>
          </div>


          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={
              disabled
            }
            onClick={() =>
              onFileChange(
                null
              )
            }
            className={[
              "shrink-0",

              "hover:bg-destructive/10",
              "hover:text-destructive",
            ].join(" ")}
            aria-label="Remove file"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div
      {...getRootProps()}
      className={cn(
        [
          "group",
          "relative",
          "cursor-pointer",
          "overflow-hidden",

          "rounded-[1.5rem]",

          "border-2",
          "border-dashed",

          "p-7",
          "text-center",

          "transition-all",
          "duration-300",

          "sm:p-10",
        ].join(" "),

        isDragActive
          ? [
              "border-primary",
              "bg-primary/8",

              "shadow-[0_20px_70px_-40px_var(--primary)]",
            ].join(" ")
          : [
              "border-border/90",
              "bg-muted/15",

              "hover:-translate-y-0.5",
              "hover:border-primary/45",
              "hover:bg-primary/4",
              "hover:shadow-[0_20px_60px_-45px_var(--primary)]",
            ].join(" "),

        disabled &&
          "pointer-events-none opacity-60"
      )}
    >
      <input
        {...getInputProps()}
      />


      <div
        className={[
          "pointer-events-none",
          "absolute",
          "left-1/2",
          "top-0",

          "h-36",
          "w-72",

          "-translate-x-1/2",
          "-translate-y-1/2",

          "rounded-full",

          "bg-primary/10",
          "blur-3xl",

          "transition-opacity",
          "duration-300",

          "group-hover:opacity-100",
        ].join(" ")}
      />


      <div className="relative">
        <div
          className={[
            "premium-icon-box",

            "mx-auto",

            "flex",
            "size-16",
            "items-center",
            "justify-center",

            "rounded-2xl",

            "transition-all",
            "duration-300",

            "group-hover:-translate-y-1",
            "group-hover:scale-105",
          ].join(" ")}
        >
          <UploadCloud className="size-7" />
        </div>


        <h3
          className={[
            "mt-5",

            "text-base",
            "font-semibold",
            "tracking-[-0.02em]",
          ].join(" ")}
        >
          {isDragActive
            ? "Drop your file here"
            : "Upload source content"}
        </h3>


        <p
          className={[
            "mx-auto",
            "mt-2",
            "max-w-lg",

            "text-sm",
            "leading-6",
            "text-muted-foreground",
          ].join(" ")}
        >
          Drag and drop your source file here, or click to browse
          from your computer.
        </p>


        <div
          className={[
            "mt-5",

            "flex",
            "flex-wrap",
            "items-center",
            "justify-center",
            "gap-2",
          ].join(" ")}
        >
          {[
            "PDF",
            "DOCX",
            "TXT",
            "CSV",
            "XLSX",
            "JSON",
            "IMAGE",
            "VIDEO",
          ].map(
            (
              item
            ) => (
              <span
                key={
                  item
                }
                className={[
                  "rounded-full",

                  "border",
                  "border-border/70",

                  "bg-background/70",

                  "px-2.5",
                  "py-1",

                  "text-[9px]",
                  "font-bold",
                  "tracking-[0.08em]",
                  "text-muted-foreground",
                ].join(" ")}
              >
                {item}
              </span>
            )
          )}
        </div>


        <p
          className={[
            "mt-5",

            "text-[10px]",
            "font-semibold",
            "uppercase",
            "tracking-[0.12em]",
            "text-primary",
          ].join(" ")}
        >
          Secure upload · Maximum 50 MB
        </p>
      </div>
    </div>
  );
}