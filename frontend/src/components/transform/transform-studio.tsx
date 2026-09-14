"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowRight,
  BrainCircuit,
  Check,
  ChevronDown,
  FileText,
  Languages,
  Loader2,
  MessageSquareText,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  UploadCloud,
  Users,
  WandSparkles,
} from "lucide-react";

import {
  useMutation,
} from "@tanstack/react-query";

import {
  toast,
} from "sonner";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  OutputSelector,
} from "@/components/transform/output-selector";

import {
  ProcessingState,
} from "@/components/transform/processing-state";

import {
  SourceInput,
} from "@/components/transform/source-input";

import {
  createTextDocument,
  uploadDocument,
} from "@/lib/api/documents";

import {
  getApiErrorMessage,
} from "@/lib/api/client";

import {
  createTransformation,
} from "@/lib/api/transformations";

import {
  AUDIENCE_OPTIONS,
  LANGUAGE_OPTIONS,
  TONE_OPTIONS,
} from "@/lib/constants/transformation";

import {
  cn,
} from "@/lib/utils";

import type {
  OutputType,
  TransformationRequest,
} from "@/types/api";


type InputMode =
  | "file"
  | "text";


interface PreparedSource {
  id:
    string;

  filename:
    string;

  inputType:
    string;

  characterCount:
    number;
}


const DEFAULT_OUTPUTS:
  OutputType[] = [
    "executive_summary",
    "presentation",
    "linkedin",
  ];


const selectClassName = [
  "h-11",
  "w-full",

  "appearance-none",

  "rounded-xl",

  "border",
  "border-input",

  "bg-background/60",

  "px-3.5",
  "pr-10",

  "text-sm",
  "font-medium",

  "outline-none",

  "transition-all",
  "duration-200",

  "hover:border-primary/30",

  "focus:border-primary/50",
  "focus:ring-4",
  "focus:ring-primary/10",

  "disabled:cursor-not-allowed",
  "disabled:opacity-50",
].join(" ");


const DETAIL_OPTIONS = [
  {
    value:
      "concise" as const,

    label:
      "Concise",

    description:
      "Short and decision-focused.",
  },

  {
    value:
      "balanced" as const,

    label:
      "Balanced",

    description:
      "Best mix of clarity and depth.",
  },

  {
    value:
      "detailed" as const,

    label:
      "Detailed",

    description:
      "Maximum useful source context.",
  },
];


export function TransformStudio() {
  const router =
    useRouter();


  const [
    inputMode,
    setInputMode,
  ] =
    useState<InputMode>(
      "file"
    );


  const [
    file,
    setFile,
  ] =
    useState<File | null>(
      null
    );


  const [
    textTitle,
    setTextTitle,
  ] =
    useState("");


  const [
    textContent,
    setTextContent,
  ] =
    useState("");


  const [
    preparedSource,
    setPreparedSource,
  ] =
    useState<PreparedSource | null>(
      null
    );


  const [
    targetAudience,
    setTargetAudience,
  ] =
    useState(
      "General Public"
    );


  const [
    tone,
    setTone,
  ] =
    useState(
      "Professional"
    );


  const [
    language,
    setLanguage,
  ] =
    useState(
      "English"
    );


  const [
    detailLevel,
    setDetailLevel,
  ] =
    useState<
      | "concise"
      | "balanced"
      | "detailed"
    >(
      "balanced"
    );


  const [
    objective,
    setObjective,
  ] =
    useState(
      "Communicate the most important information clearly and accurately."
    );


  const [
    customInstructions,
    setCustomInstructions,
  ] =
    useState("");


  const [
    selectedOutputs,
    setSelectedOutputs,
  ] =
    useState<OutputType[]>(
      DEFAULT_OUTPUTS
    );


  const [
    useRag,
    setUseRag,
  ] =
    useState(
      true
    );


  const [
    processingStage,
    setProcessingStage,
  ] =
    useState(
      0
    );


  const prepareSourceMutation =
    useMutation({
      mutationFn:
        async () => {
          if (
            inputMode ===
            "file"
          ) {
            if (
              !file
            ) {
              throw new Error(
                "Select a source file first."
              );
            }


            const result =
              await uploadDocument(
                file,
                "en"
              );


            return {
              id:
                result.document_id,

              filename:
                result.filename,

              inputType:
                result.input_type,

              characterCount:
                result.character_count,
            };
          }


          if (
            !textTitle.trim()
          ) {
            throw new Error(
              "Enter a title for the text source."
            );
          }


          if (
            !textContent.trim()
          ) {
            throw new Error(
              "Paste or type source content first."
            );
          }


          const result =
            await createTextDocument(
              {
                title:
                  textTitle.trim(),

                content:
                  textContent.trim(),

                language:
                  "auto",
              }
            );


          return {
            id:
              result.id,

            filename:
              result.original_filename,

            inputType:
              result.input_type,

            characterCount:
              result.character_count,
          };
        },


      onSuccess:
        (
          result
        ) => {
          setPreparedSource(
            result
          );


          toast.success(
            "Source prepared successfully."
          );
        },


      onError:
        (
          error
        ) => {
          toast.error(
            getApiErrorMessage(
              error
            )
          );
        },
    });


  const transformationMutation =
    useMutation({
      mutationFn:
        async (
          request:
            TransformationRequest
        ) =>
          createTransformation(
            request
          ),


      onSuccess:
        (
          result
        ) => {
          toast.success(
            "AI transformation completed."
          );


          router.push(
            `/results/${result.transformation_id}`
          );
        },


      onError:
        (
          error
        ) => {
          toast.error(
            getApiErrorMessage(
              error
            )
          );
        },
    });


  useEffect(
    () => {
      if (
        !transformationMutation.isPending
      ) {
        return;
      }


      const timer =
        window.setInterval(
          () => {
            setProcessingStage(
              (
                current
              ) =>
                Math.min(
                  current +
                    1,
                  3
                )
            );
          },

          5000
        );


      return () => {
        window.clearInterval(
          timer
        );
      };
    },

    [
      transformationMutation.isPending,
    ]
  );


  const busy =
    prepareSourceMutation.isPending ||
    transformationMutation.isPending;


  function resetSource() {
    if (
      busy
    ) {
      return;
    }


    setPreparedSource(
      null
    );

    setFile(
      null
    );

    setTextTitle(
      ""
    );

    setTextContent(
      ""
    );
  }


  function startTransformation() {
    if (
      !preparedSource
    ) {
      toast.error(
        "Prepare a source document first."
      );

      return;
    }


    if (
      targetAudience
        .trim()
        .length <
      2
    ) {
      toast.error(
        "Select a target audience."
      );

      return;
    }


    if (
      objective
        .trim()
        .length <
      2
    ) {
      toast.error(
        "Enter a communication objective."
      );

      return;
    }


    if (
      selectedOutputs.length ===
      0
    ) {
      toast.error(
        "Select at least one output format."
      );

      return;
    }


    const request:
      TransformationRequest =
      {
        document_id:
          preparedSource.id,

        target_audience:
          targetAudience,

        tone,

        language,

        detail_level:
          detailLevel,

        objective:
          objective.trim(),

        selected_outputs:
          selectedOutputs,

        custom_instructions:
          customInstructions.trim(),

        use_rag:
          useRag,
      };


    setProcessingStage(
      0
    );


    transformationMutation.mutate(
      request
    );
  }


  if (
    transformationMutation.isPending
  ) {
    return (
      <div className="mx-auto max-w-[1500px]">
        <ProcessingState
          currentStage={
            processingStage
          }
        />
      </div>
    );
  }


  return (
    <div className="mx-auto max-w-[1500px] space-y-6 lg:space-y-7">
      {/* =====================================================
          HERO
          ===================================================== */}

      <section
        className={[
          "relative",
          "overflow-hidden",

          "rounded-[1.75rem]",

          "border",
          "border-primary/15",

          "bg-gradient-to-br",
          "from-primary/10",
          "via-card/90",
          "to-card",

          "p-6",

          "shadow-[0_28px_85px_-58px_rgba(0,0,0,0.6)]",

          "sm:p-7",
        ].join(" ")}
      >
        <div
          className={[
            "pointer-events-none",
            "absolute",
            "-right-28",
            "-top-32",

            "size-80",

            "rounded-full",

            "bg-primary/12",
            "blur-[85px]",
          ].join(" ")}
        />


        <div
          className={[
            "relative",

            "flex",
            "flex-col",
            "justify-between",
            "gap-6",

            "lg:flex-row",
            "lg:items-end",
          ].join(" ")}
        >
          <div>
            <div className="premium-kicker">
              <WandSparkles className="size-3.5" />

              AI Transformation Workspace
            </div>

            <h1
              className={[
                "mt-4",

                "text-3xl",
                "font-bold",
                "tracking-[-0.045em]",

                "sm:text-4xl",
              ].join(" ")}
            >
              Transform Studio
            </h1>

            <p
              className={[
                "mt-3",
                "max-w-3xl",

                "text-sm",
                "leading-6",
                "text-muted-foreground",
              ].join(" ")}
            >
              Add one source, configure how it should communicate,
              and generate multiple grounded, audience-ready assets
              from the same intelligence.
            </p>
          </div>


          <div
            className={[
              "grid",
              "grid-cols-3",
              "gap-2",

              "sm:flex",
            ].join(" ")}
          >
            {[
              {
                number:
                  "01",

                label:
                  "Source",

                complete:
                  Boolean(
                    preparedSource
                  ),
              },

              {
                number:
                  "02",

                label:
                  "Configure",

                complete:
                  Boolean(
                    preparedSource
                  ),
              },

              {
                number:
                  "03",

                label:
                  "Generate",

                complete:
                  false,
              },
            ].map(
              (
                item
              ) => (
                <div
                  key={
                    item.number
                  }
                  className={[
                    "flex",
                    "items-center",
                    "gap-2",

                    "rounded-xl",

                    "border",

                    item.complete
                      ? "border-primary/25 bg-primary/8"
                      : "border-border/70 bg-background/45",

                    "px-3",
                    "py-2.5",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex",
                      "size-6",
                      "items-center",
                      "justify-center",

                      "rounded-lg",

                      item.complete
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",

                      "text-[9px]",
                      "font-bold",
                    ].join(" ")}
                  >
                    {item.complete ? (
                      <Check className="size-3" />
                    ) : (
                      item.number
                    )}
                  </span>

                  <span className="hidden text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground sm:inline">
                    {
                      item.label
                    }
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </section>


      {/* =====================================================
          SOURCE
          ===================================================== */}

      <Card className="premium-card overflow-hidden">
        <CardHeader className="border-b border-border/60 pb-5">
          <div className="flex items-start gap-4">
            <div className="premium-icon-box flex size-11 shrink-0 items-center justify-center rounded-xl">
              <UploadCloud className="size-5" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>
                  Source Intelligence
                </CardTitle>

                <Badge
                  variant="outline"
                  className="border-primary/20 bg-primary/5 text-[9px] text-primary"
                >
                  STEP 01
                </Badge>
              </div>

              <CardDescription>
                Upload a supported file or paste source text for
                extraction and analysis.
              </CardDescription>
            </div>
          </div>
        </CardHeader>


        <CardContent className="space-y-5 pt-6">
          {!preparedSource ? (
            <>
              <div
                className={[
                  "grid",
                  "grid-cols-2",
                  "gap-1",

                  "rounded-xl",

                  "border",
                  "border-border/70",

                  "bg-muted/35",

                  "p-1",
                ].join(" ")}
              >
                <button
                  type="button"
                  disabled={
                    busy
                  }
                  onClick={() =>
                    setInputMode(
                      "file"
                    )
                  }
                  className={cn(
                    [
                      "flex",
                      "items-center",
                      "justify-center",
                      "gap-2",

                      "rounded-lg",

                      "px-4",
                      "py-2.5",

                      "text-sm",
                      "font-semibold",

                      "transition-all",
                      "duration-200",
                    ].join(" "),

                    inputMode ===
                      "file"
                      ? [
                          "bg-background",
                          "text-foreground",

                          "shadow-sm",

                          "ring-1",
                          "ring-primary/10",
                        ].join(" ")
                      : [
                          "text-muted-foreground",

                          "hover:bg-background/50",
                          "hover:text-foreground",
                        ].join(" ")
                  )}
                >
                  <UploadCloud className="size-4" />

                  Upload File
                </button>


                <button
                  type="button"
                  disabled={
                    busy
                  }
                  onClick={() =>
                    setInputMode(
                      "text"
                    )
                  }
                  className={cn(
                    [
                      "flex",
                      "items-center",
                      "justify-center",
                      "gap-2",

                      "rounded-lg",

                      "px-4",
                      "py-2.5",

                      "text-sm",
                      "font-semibold",

                      "transition-all",
                      "duration-200",
                    ].join(" "),

                    inputMode ===
                      "text"
                      ? [
                          "bg-background",
                          "text-foreground",

                          "shadow-sm",

                          "ring-1",
                          "ring-primary/10",
                        ].join(" ")
                      : [
                          "text-muted-foreground",

                          "hover:bg-background/50",
                          "hover:text-foreground",
                        ].join(" ")
                  )}
                >
                  <FileText className="size-4" />

                  Paste Text
                </button>
              </div>


              {inputMode ===
              "file" ? (
                <SourceInput
                  file={
                    file
                  }
                  disabled={
                    busy
                  }
                  onFileChange={
                    setFile
                  }
                  onRejected={(
                    message
                  ) =>
                    toast.error(
                      message
                    )
                  }
                />
              ) : (
                <div className="grid gap-5 xl:grid-cols-[0.38fr_0.62fr]">
                  <div
                    className={[
                      "rounded-2xl",

                      "border",
                      "border-border/70",

                      "bg-muted/15",

                      "p-5",
                    ].join(" ")}
                  >
                    <div className="premium-icon-box flex size-10 items-center justify-center rounded-xl">
                      <FileText className="size-4" />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold">
                      Direct Text Source
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Paste an article, report, notes, prompt or any
                      other textual source directly into the workspace.
                    </p>

                    <div className="mt-5 space-y-2">
                      <Label
                        htmlFor="text-title"
                        className="text-xs font-semibold"
                      >
                        Source title
                      </Label>

                      <Input
                        id="text-title"
                        placeholder="e.g. Digital India policy article"
                        className="h-11 rounded-xl bg-background/65"
                        value={
                          textTitle
                        }
                        disabled={
                          busy
                        }
                        onChange={(
                          event
                        ) =>
                          setTextTitle(
                            event.target
                              .value
                          )
                        }
                      />
                    </div>
                  </div>


                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <Label
                        htmlFor="source-text"
                        className="text-xs font-semibold"
                      >
                        Source content
                      </Label>

                      <span className="text-[10px] font-medium text-muted-foreground">
                        {textContent.length.toLocaleString(
                          "en-IN"
                        )}{" "}
                        characters
                      </span>
                    </div>

                    <Textarea
                      id="source-text"
                      placeholder="Paste an article, report, prompt, notes or other source content..."
                      className={[
                        "min-h-[255px]",
                        "resize-y",

                        "rounded-2xl",

                        "bg-background/60",

                        "leading-6",
                      ].join(" ")}
                      value={
                        textContent
                      }
                      disabled={
                        busy
                      }
                      onChange={(
                        event
                      ) =>
                        setTextContent(
                          event.target
                            .value
                        )
                      }
                    />
                  </div>
                </div>
              )}


              <div
                className={[
                  "flex",
                  "flex-col",
                  "justify-between",
                  "gap-4",

                  "border-t",
                  "border-border/60",

                  "pt-5",

                  "sm:flex-row",
                  "sm:items-center",
                ].join(" ")}
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-4 text-primary" />

                  Files are validated before processing.
                </div>

                <Button
                  type="button"
                  size="lg"
                  className="h-11 min-w-40"
                  disabled={
                    prepareSourceMutation.isPending ||
                    (
                      inputMode ===
                        "file" &&
                      !file
                    ) ||
                    (
                      inputMode ===
                        "text" &&
                      (
                        !textTitle.trim() ||
                        !textContent.trim()
                      )
                    )
                  }
                  onClick={() =>
                    prepareSourceMutation.mutate()
                  }
                >
                  {prepareSourceMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <BrainCircuit className="size-4" />
                  )}

                  Prepare Source
                </Button>
              </div>
            </>
          ) : (
            <Alert
              className={[
                "border-primary/20",
                "bg-primary/5",
              ].join(" ")}
            >
              <Check className="size-4 text-primary" />

              <AlertTitle>
                Source intelligence ready
              </AlertTitle>

              <AlertDescription>
                <div
                  className={[
                    "mt-3",

                    "flex",
                    "flex-col",
                    "justify-between",
                    "gap-4",

                    "sm:flex-row",
                    "sm:items-center",
                  ].join(" ")}
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {
                        preparedSource.filename
                      }
                    </p>

                    <div
                      className={[
                        "mt-1.5",

                        "flex",
                        "flex-wrap",
                        "items-center",
                        "gap-x-2",
                        "gap-y-1",

                        "text-xs",
                      ].join(" ")}
                    >
                      <span className="font-semibold text-primary">
                        {preparedSource.inputType.toUpperCase()}
                      </span>

                      <span>
                        •
                      </span>

                      <span>
                        {preparedSource.characterCount.toLocaleString(
                          "en-IN"
                        )}{" "}
                        extracted characters
                      </span>
                    </div>
                  </div>


                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      busy
                    }
                    onClick={
                      resetSource
                    }
                  >
                    <RotateCcw className="size-3.5" />

                    Change Source
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>


      {/* =====================================================
          TRANSFORMATION CONTROLS
          ===================================================== */}

      <Card className="premium-card overflow-hidden">
        <CardHeader className="border-b border-border/60 pb-5">
          <div className="flex items-start gap-4">
            <div className="premium-icon-box flex size-11 shrink-0 items-center justify-center rounded-xl">
              <SlidersHorizontal className="size-5" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>
                  Transformation Controls
                </CardTitle>

                <Badge
                  variant="outline"
                  className="border-primary/20 bg-primary/5 text-[9px] text-primary"
                >
                  STEP 02
                </Badge>
              </div>

              <CardDescription>
                Define the audience, communication style and generation
                objective.
              </CardDescription>
            </div>
          </div>
        </CardHeader>


        <CardContent className="space-y-7 pt-6">
          {/* Main selectors */}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label
                htmlFor="audience"
                className="flex items-center gap-2 text-xs font-semibold"
              >
                <Users className="size-3.5 text-primary" />

                Target audience
              </Label>

              <div className="relative">
                <select
                  id="audience"
                  className={
                    selectClassName
                  }
                  value={
                    targetAudience
                  }
                  disabled={
                    busy
                  }
                  onChange={(
                    event
                  ) =>
                    setTargetAudience(
                      event.target
                        .value
                    )
                  }
                >
                  {AUDIENCE_OPTIONS.map(
                    (
                      item
                    ) => (
                      <option
                        key={
                          item
                        }
                        value={
                          item
                        }
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>


            <div className="space-y-2">
              <Label
                htmlFor="tone"
                className="flex items-center gap-2 text-xs font-semibold"
              >
                <MessageSquareText className="size-3.5 text-primary" />

                Tone
              </Label>

              <div className="relative">
                <select
                  id="tone"
                  className={
                    selectClassName
                  }
                  value={
                    tone
                  }
                  disabled={
                    busy
                  }
                  onChange={(
                    event
                  ) =>
                    setTone(
                      event.target
                        .value
                    )
                  }
                >
                  {TONE_OPTIONS.map(
                    (
                      item
                    ) => (
                      <option
                        key={
                          item
                        }
                        value={
                          item
                        }
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>


            <div className="space-y-2">
              <Label
                htmlFor="language"
                className="flex items-center gap-2 text-xs font-semibold"
              >
                <Languages className="size-3.5 text-primary" />

                Output language
              </Label>

              <div className="relative">
                <select
                  id="language"
                  className={
                    selectClassName
                  }
                  value={
                    language
                  }
                  disabled={
                    busy
                  }
                  onChange={(
                    event
                  ) =>
                    setLanguage(
                      event.target
                        .value
                    )
                  }
                >
                  {LANGUAGE_OPTIONS.map(
                    (
                      item
                    ) => (
                      <option
                        key={
                          item
                        }
                        value={
                          item
                        }
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>


          {/* Detail level */}

          <div className="space-y-3">
            <div>
              <Label className="text-xs font-semibold">
                Detail level
              </Label>

              <p className="mt-1 text-[11px] text-muted-foreground">
                Control how much depth and supporting context the AI
                includes.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {DETAIL_OPTIONS.map(
                (
                  option
                ) => {
                  const active =
                    detailLevel ===
                    option.value;


                  return (
                    <button
                      key={
                        option.value
                      }
                      type="button"
                      disabled={
                        busy
                      }
                      onClick={() =>
                        setDetailLevel(
                          option.value
                        )
                      }
                      className={cn(
                        [
                          "relative",

                          "rounded-xl",

                          "border",

                          "p-4",
                          "text-left",

                          "transition-all",
                          "duration-200",
                        ].join(" "),

                        active
                          ? [
                              "border-primary/35",
                              "bg-primary/8",

                              "shadow-[0_12px_35px_-28px_var(--primary)]",
                            ].join(" ")
                          : [
                              "border-border/75",
                              "bg-background/40",

                              "hover:border-primary/25",
                              "hover:bg-primary/4",
                            ].join(" ")
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={cn(
                            "text-sm font-semibold",

                            active &&
                              "text-primary"
                          )}
                        >
                          {
                            option.label
                          }
                        </span>

                        <span
                          className={cn(
                            [
                              "flex",
                              "size-5",
                              "items-center",
                              "justify-center",

                              "rounded-full",

                              "border",
                            ].join(" "),

                            active
                              ? [
                                  "border-primary",
                                  "bg-primary",
                                  "text-primary-foreground",
                                ].join(" ")
                              : "border-border text-transparent"
                          )}
                        >
                          <Check className="size-3" />
                        </span>
                      </div>

                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {
                          option.description
                        }
                      </p>
                    </button>
                  );
                }
              )}
            </div>
          </div>


          {/* Objective + instructions */}

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="objective"
                className="flex items-center gap-2 text-xs font-semibold"
              >
                <Target className="size-3.5 text-primary" />

                Communication objective
              </Label>

              <Textarea
                id="objective"
                className="min-h-32 resize-y rounded-2xl bg-background/55 leading-6"
                value={
                  objective
                }
                disabled={
                  busy
                }
                onChange={(
                  event
                ) =>
                  setObjective(
                    event.target
                      .value
                  )
                }
              />

              <p className="text-[10px] text-muted-foreground">
                Tell the model what the final communication should
                achieve.
              </p>
            </div>


            <div className="space-y-2">
              <Label
                htmlFor="instructions"
                className="text-xs font-semibold"
              >
                Custom instructions

                <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                  Optional
                </span>
              </Label>

              <Textarea
                id="instructions"
                className="min-h-32 resize-y rounded-2xl bg-background/55 leading-6"
                placeholder="Example: Emphasize citizen impact, preserve all statistics and avoid unnecessary jargon."
                value={
                  customInstructions
                }
                disabled={
                  busy
                }
                onChange={(
                  event
                ) =>
                  setCustomInstructions(
                    event.target
                      .value
                  )
                }
              />

              <p className="text-[10px] text-muted-foreground">
                Add constraints, emphasis or stylistic requirements
                specific to this transformation.
              </p>
            </div>
          </div>


          {/* RAG */}

          <button
            type="button"
            disabled={
              busy
            }
            onClick={() =>
              setUseRag(
                (
                  current
                ) =>
                  !current
              )
            }
            className={cn(
              [
                "group",
                "relative",
                "w-full",
                "overflow-hidden",

                "rounded-2xl",

                "border",

                "p-4",
                "text-left",

                "transition-all",
                "duration-250",

                "sm:p-5",
              ].join(" "),

              useRag
                ? [
                    "border-primary/30",
                    "bg-primary/7",

                    "shadow-[0_18px_50px_-38px_var(--primary)]",
                  ].join(" ")
                : [
                    "border-border/75",
                    "bg-background/40",

                    "hover:border-primary/20",
                  ].join(" ")
            )}
          >
            <div
              className={[
                "flex",
                "items-start",
                "gap-4",
              ].join(" ")}
            >
              <div
                className={cn(
                  [
                    "flex",
                    "size-11",
                    "shrink-0",
                    "items-center",
                    "justify-center",

                    "rounded-xl",

                    "border",

                    "transition-all",
                  ].join(" "),

                  useRag
                    ? [
                        "border-primary/25",
                        "bg-primary",
                        "text-primary-foreground",
                      ].join(" ")
                    : [
                        "border-border",
                        "bg-muted/50",
                        "text-muted-foreground",
                      ].join(" ")
                )}
              >
                <BrainCircuit className="size-5" />
              </div>


              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">
                    Ground outputs using RAG
                  </span>

                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px]",

                      useRag
                        ? "border-primary/25 bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {useRag
                      ? "ENABLED"
                      : "DISABLED"}
                  </Badge>
                </div>

                <p className="mt-1.5 max-w-3xl text-xs leading-5 text-muted-foreground">
                  Retrieve semantically relevant source evidence
                  before generation to improve grounding, factual
                  consistency and source traceability.
                </p>
              </div>


              <div
                className={cn(
                  [
                    "relative",
                    "mt-1",
                    "h-6",
                    "w-11",
                    "shrink-0",

                    "rounded-full",

                    "border",

                    "transition-all",
                  ].join(" "),

                  useRag
                    ? [
                        "border-primary",
                        "bg-primary",
                      ].join(" ")
                    : [
                        "border-border",
                        "bg-muted",
                      ].join(" ")
                )}
              >
                <span
                  className={cn(
                    [
                      "absolute",
                      "top-0.5",

                      "size-5",

                      "rounded-full",

                      "bg-white",

                      "shadow-sm",

                      "transition-all",
                      "duration-200",
                    ].join(" "),

                    useRag
                      ? "left-[20px]"
                      : "left-0.5"
                  )}
                />
              </div>
            </div>
          </button>
        </CardContent>
      </Card>


      {/* =====================================================
          OUTPUTS
          ===================================================== */}

      <Card className="premium-card overflow-hidden">
        <CardHeader className="border-b border-border/60 pb-5">
          <div
            className={[
              "flex",
              "flex-col",
              "justify-between",
              "gap-4",

              "sm:flex-row",
              "sm:items-start",
            ].join(" ")}
          >
            <div className="flex items-start gap-4">
              <div className="premium-icon-box flex size-11 shrink-0 items-center justify-center rounded-xl">
                <Sparkles className="size-5" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>
                    Output Portfolio
                  </CardTitle>

                  <Badge
                    variant="outline"
                    className="border-primary/20 bg-primary/5 text-[9px] text-primary"
                  >
                    STEP 03
                  </Badge>
                </div>

                <CardDescription>
                  Select one or more formats to generate from the same
                  source intelligence.
                </CardDescription>
              </div>
            </div>


            <div
              className={[
                "rounded-full",

                "border",
                "border-primary/20",

                "bg-primary/7",

                "px-3",
                "py-1.5",

                "text-[10px]",
                "font-bold",
                "uppercase",
                "tracking-[0.08em]",
                "text-primary",
              ].join(" ")}
            >
              {selectedOutputs.length} selected
            </div>
          </div>
        </CardHeader>


        <CardContent className="pt-6">
          <OutputSelector
            value={
              selectedOutputs
            }
            disabled={
              busy
            }
            onChange={
              setSelectedOutputs
            }
          />


          {/* Final action */}

          <div
            className={[
              "mt-7",
              "relative",
              "overflow-hidden",

              "rounded-2xl",

              "border",
              "border-primary/20",

              "bg-gradient-to-r",
              "from-primary/8",
              "via-card",
              "to-card",

              "p-5",
            ].join(" ")}
          >
            <div
              className={[
                "pointer-events-none",
                "absolute",
                "-right-16",
                "-top-16",

                "size-40",

                "rounded-full",

                "bg-primary/12",
                "blur-3xl",
              ].join(" ")}
            />


            <div
              className={[
                "relative",

                "flex",
                "flex-col",
                "justify-between",
                "gap-5",

                "lg:flex-row",
                "lg:items-center",
              ].join(" ")}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={[
                      "flex",
                      "size-8",
                      "items-center",
                      "justify-center",

                      "rounded-lg",

                      "bg-primary/10",
                      "text-primary",
                    ].join(" ")}
                  >
                    <ShieldCheck className="size-4" />
                  </span>

                  <p className="text-sm font-semibold">
                    Ready for AI transformation
                  </p>
                </div>


                <div
                  className={[
                    "mt-2.5",

                    "flex",
                    "flex-wrap",
                    "items-center",
                    "gap-x-3",
                    "gap-y-1",

                    "text-xs",
                    "text-muted-foreground",
                  ].join(" ")}
                >
                  <span>
                    {preparedSource
                      ? "Source ready"
                      : "Source required"}
                  </span>

                  <span>
                    •
                  </span>

                  <span>
                    {selectedOutputs.length}{" "}
                    output
                    {selectedOutputs.length ===
                    1
                      ? ""
                      : "s"}
                  </span>

                  <span>
                    •
                  </span>

                  <span>
                    {useRag
                      ? "RAG grounding enabled"
                      : "Direct source context"}
                  </span>
                </div>
              </div>


              <Button
                type="button"
                size="lg"
                className={[
                  "h-12",
                  "shrink-0",

                  "px-6",

                  "text-sm",
                ].join(" ")}
                disabled={
                  !preparedSource ||
                  selectedOutputs.length ===
                    0 ||
                  busy
                }
                onClick={
                  startTransformation
                }
              >
                <WandSparkles className="size-4" />

                Start AI Transformation

                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}