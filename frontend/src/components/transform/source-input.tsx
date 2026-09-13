"use client";

import {
  useCallback,
} from "react";

import {
  FileImage,
  FileSpreadsheet,
  FileText,
  UploadCloud,
  Video,
  X,
} from "lucide-react";

import {
  useDropzone,
} from "react-dropzone";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

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


function FileIcon({
  filename,
}: {
  filename:
    string;
}) {
  const extension =
    filename
      .split(".")
      .pop()
      ?.toLowerCase();


  if (
    [
      "mp4",
      "mov",
      "webm",
    ].includes(
      extension ?? ""
    )
  ) {

    return (
      <Video className="size-6" />
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
      extension ?? ""
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
    ].includes(
      extension ?? ""
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
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileIcon
              filename={
                file.name
              }
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {
                file.name
              }
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {formatBytes(
                file.size
              )}
            </p>
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
            aria-label="Remove file"
          >
            <X className="size-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }


  return (
    <div
      {...getRootProps()}
      className={cn(
        "cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors",

        isDragActive
          ? "border-primary bg-primary/5"
          : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40",

        disabled &&
          "pointer-events-none opacity-60"
      )}
    >
      <input
        {...getInputProps()}
      />

      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <UploadCloud className="size-7" />
      </div>

      <h3 className="mt-5 font-semibold">
        Drop your source content here
      </h3>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
        PDF, DOCX, TXT, JSON, CSV, XLSX,
        images or MP4/MOV/WebM videos up to
        50 MB.
      </p>

      <p className="mt-4 text-xs font-medium text-primary">
        Click to browse or drag and drop
      </p>
    </div>
  );
}