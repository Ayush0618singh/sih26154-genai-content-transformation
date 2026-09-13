import type {
  OutputType,
} from "@/types/api";


export interface OutputOption {
  value: OutputType;

  label: string;

  description: string;
}


export const OUTPUT_OPTIONS: OutputOption[] = [
  {
    value:
      "executive_summary",

    label:
      "Executive Summary",

    description:
      "Concise decision-ready overview with key findings.",
  },

  {
    value:
      "detailed_summary",

    label:
      "Detailed Summary",

    description:
      "Structured deep summary preserving important details.",
  },

  {
    value:
      "advisory",

    label:
      "Advisory",

    description:
      "Recommendations, risks, priorities and next steps.",
  },

  {
    value:
      "linkedin",

    label:
      "LinkedIn Post",

    description:
      "Professional audience-ready LinkedIn communication.",
  },

  {
    value:
      "x_thread",

    label:
      "X Thread",

    description:
      "A factual multi-post thread with a strong hook.",
  },

  {
    value:
      "infographic",

    label:
      "Infographic",

    description:
      "Structured infographic content and visual blueprint.",
  },

  {
    value:
      "presentation",

    label:
      "Presentation",

    description:
      "Slide storyline, bullets, speaker notes and visuals.",
  },

  {
    value:
      "video_script",

    label:
      "Video Script",

    description:
      "Scene-by-scene video, voice-over and captions.",
  },

  {
    value:
      "action_items",

    label:
      "Action Items",

    description:
      "Practical actions with owners, priority and outcome.",
  },

  {
    value:
      "structured_data",

    label:
      "Structured Data",

    description:
      "Important source information converted into fields.",
  },
];


export const AUDIENCE_OPTIONS = [
  "General Public",
  "Government Decision Makers",
  "Senior Leadership",
  "Technical Professionals",
  "Students",
  "Researchers",
  "Business Professionals",
  "Media and Communication Teams",
];


export const TONE_OPTIONS = [
  "Professional",
  "Formal",
  "Conversational",
  "Educational",
  "Executive",
  "Persuasive",
  "Technical",
];


export const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Hinglish",
  "Bengali",
  "Tamil",
  "Telugu",
  "Marathi",
  "Gujarati",
  "Punjabi",
  "Kannada",
  "Malayalam",
];