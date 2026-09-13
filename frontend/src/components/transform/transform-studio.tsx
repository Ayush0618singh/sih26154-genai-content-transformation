"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  FileText,
  Loader2,
  RotateCcw,
  Sparkles,
  UploadCloud,
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
  id: string;

  filename: string;

  inputType: string;

  characterCount: number;
}


const DEFAULT_OUTPUTS:
  OutputType[] = [
    "executive_summary",
    "presentation",
    "linkedin",
  ];


const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50";


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
  ] = useState("");

  const [
    textContent,
    setTextContent,
  ] = useState("");

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
  ] = useState(
    "General Public"
  );

  const [
    tone,
    setTone,
  ] = useState(
    "Professional"
  );

  const [
    language,
    setLanguage,
  ] = useState(
    "English"
  );

  const [
    detailLevel,
    setDetailLevel,
  ] = useState<
    | "concise"
    | "balanced"
    | "detailed"
  >("balanced");

  const [
    objective,
    setObjective,
  ] = useState(
    "Communicate the most important information clearly and accurately."
  );

  const [
    customInstructions,
    setCustomInstructions,
  ] = useState("");

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
  ] = useState(true);

  const [
    processingStage,
    setProcessingStage,
  ] = useState(0);


  const prepareSourceMutation =
    useMutation({
      mutationFn:
        async () => {
          if (
            inputMode ===
            "file"
          ) {
            if (!file) {
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


  useEffect(() => {
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
  }, [
    transformationMutation.isPending,
  ]);


  const busy =
    prepareSourceMutation.isPending ||
    transformationMutation.isPending;


  function resetSource() {
    if (busy) {
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
      targetAudience.trim()
        .length < 2
    ) {
      toast.error(
        "Select a target audience."
      );

      return;
    }

    if (
      objective.trim()
        .length < 2
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

    /*
     * Reset estimated UI progress
     * before starting a new request.
     *
     * This avoids performing a
     * synchronous state update inside
     * the effect itself.
     */
    setProcessingStage(
      0
    );

    transformationMutation.mutate(
      request
    );
  }


  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <Badge
          variant="secondary"
          className="gap-1.5"
        >
          <Sparkles className="size-3" />

          GenAI Transformation
        </Badge>

        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Transform Studio
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Upload or paste source
          content, configure the
          target audience and
          communication objective,
          then generate multiple
          grounded outputs from one
          source.
        </p>
      </div>


      {transformationMutation.isPending ? (
        <ProcessingState
          currentStage={
            processingStage
          }
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                1. Source content
              </CardTitle>

              <CardDescription>
                Add the content that
                the AI should analyse
                and transform.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {!preparedSource && (
                <>
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
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
                        "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                        inputMode ===
                          "file"
                          ? "bg-background shadow-sm"
                          : "text-muted-foreground"
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
                        "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                        inputMode ===
                          "text"
                          ? "bg-background shadow-sm"
                          : "text-muted-foreground"
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
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="text-title">
                          Source title
                        </Label>

                        <Input
                          id="text-title"
                          placeholder="e.g. Digital India policy article"
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
                              event
                                .target
                                .value
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="source-text">
                          Source content
                        </Label>

                        <Textarea
                          id="source-text"
                          placeholder="Paste an article, report, prompt, notes or other source content..."
                          className="min-h-72 resize-y"
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
                              event
                                .target
                                .value
                            )
                          }
                        />

                        <p className="text-right text-xs text-muted-foreground">
                          {textContent.length.toLocaleString(
                            "en-IN"
                          )}{" "}
                          characters
                        </p>
                      </div>
                    </div>
                  )}

                  <Button
                    type="button"
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
                    {prepareSourceMutation.isPending && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}

                    Prepare Source
                  </Button>
                </>
              )}

              {preparedSource && (
                <Alert>
                  <FileText className="size-4" />

                  <AlertTitle>
                    Source ready
                  </AlertTitle>

                  <AlertDescription>
                    <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-medium text-foreground">
                          {
                            preparedSource.filename
                          }
                        </p>

                        <p className="mt-1 text-xs">
                          {preparedSource.inputType.toUpperCase()}
                          {" · "}
                          {preparedSource.characterCount.toLocaleString(
                            "en-IN"
                          )}{" "}
                          extracted characters
                        </p>
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
                        <RotateCcw className="mr-2 size-3.5" />

                        Change Source
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>


          <Card>
            <CardHeader>
              <CardTitle>
                2. Transformation
                controls
              </CardTitle>

              <CardDescription>
                Define exactly who the
                content is for and how
                the transformed output
                should communicate.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="audience">
                    Target audience
                  </Label>

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
                          {
                            item
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>


                <div className="space-y-2">
                  <Label htmlFor="tone">
                    Tone
                  </Label>

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
                          {
                            item
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>


                <div className="space-y-2">
                  <Label htmlFor="language">
                    Output language
                  </Label>

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
                          {
                            item
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>


              <div className="space-y-3">
                <Label>
                  Detail level
                </Label>

                <div className="grid gap-2 sm:grid-cols-3">
                  {(
                    [
                      [
                        "concise",
                        "Concise",
                      ],
                      [
                        "balanced",
                        "Balanced",
                      ],
                      [
                        "detailed",
                        "Detailed",
                      ],
                    ] as const
                  ).map(
                    (
                      [
                        value,
                        label,
                      ]
                    ) => (
                      <button
                        key={
                          value
                        }
                        type="button"
                        disabled={
                          busy
                        }
                        onClick={() =>
                          setDetailLevel(
                            value
                          )
                        }
                        className={cn(
                          "rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                          detailLevel ===
                            value
                            ? "border-primary bg-primary/5 text-primary"
                            : "hover:bg-muted"
                        )}
                      >
                        {
                          label
                        }
                      </button>
                    )
                  )}
                </div>
              </div>


              <div className="space-y-2">
                <Label htmlFor="objective">
                  Communication
                  objective
                </Label>

                <Textarea
                  id="objective"
                  className="min-h-24"
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
              </div>


              <div className="space-y-2">
                <Label htmlFor="instructions">
                  Custom instructions
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    Optional
                  </span>
                </Label>

                <Textarea
                  id="instructions"
                  className="min-h-24"
                  placeholder="Example: Emphasize citizen impact and preserve all important statistics."
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
              </div>


              <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
                <input
                  type="checkbox"
                  checked={
                    useRag
                  }
                  disabled={
                    busy
                  }
                  onChange={(
                    event
                  ) =>
                    setUseRag(
                      event.target
                        .checked
                    )
                  }
                  className="mt-1 size-4 accent-primary"
                />

                <span>
                  <span className="block text-sm font-semibold">
                    Ground outputs
                    using RAG
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    Retrieve relevant
                    source evidence
                    before generating
                    the final outputs.
                  </span>
                </span>
              </label>
            </CardContent>
          </Card>


          <Card>
            <CardHeader>
              <CardTitle>
                3. Select outputs
              </CardTitle>

              <CardDescription>
                Generate several
                communication formats
                from the same source in
                one transformation.
              </CardDescription>
            </CardHeader>

            <CardContent>
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

              <div className="mt-6 flex flex-col justify-between gap-4 border-t pt-5 sm:flex-row sm:items-center">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {
                      selectedOutputs.length
                    }
                  </span>{" "}
                  output
                  {selectedOutputs.length !==
                  1
                    ? "s"
                    : ""}{" "}
                  selected
                </p>

                <Button
                  type="button"
                  size="lg"
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
                  <Sparkles className="mr-2 size-4" />

                  Start AI
                  Transformation
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}