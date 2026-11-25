import { byTrack } from "@/lib/track";
import { CTFL_RESOURCES, PTMC_RESOURCES } from "@/data/istqb";
import { CCSK_RESOURCES } from "@/data/ccsk/memory";
/** Curated free study aids. Descriptions are honest one-liners — update if offers change. */
export interface Resource {
  name: string;
  org: string;
  url: string;
  description: string;
  tag: "Official" | "Practice" | "Mindmaps" | "Community" | "App";
}

const CISSP_RESOURCES: Resource[] = [
  {
    name: "Official CISSP Flash Cards",
    org: "ISC2",
    url: "https://www.isc2.org/certifications/flash-cards",
    description: "Free interactive flash cards across all eight domains from the exam owner; requires a short sign-up form.",
    tag: "Official",
  },
  {
    name: "CISSP Exam Outline",
    org: "ISC2",
    url: "https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline",
    description: "The authoritative list of domains, weights and sub-objectives — the blueprint everything else should map to.",
    tag: "Official",
  },
  {
    name: "Exam outlines hub",
    org: "ISC2",
    url: "https://www.isc2.org/certifications/exam-outlines",
    description: "Where ISC2 posts upcoming outline changes, including the CISSP outline taking effect April 15, 2027.",
    tag: "Official",
  },
  {
    name: "Question of the Day",
    org: "ThorTeaches",
    url: "https://thorteaches.com/qotd",
    description: "A free daily practice question from a popular CISSP instructor — good for a 2-minute habit.",
    tag: "Practice",
  },
  {
    name: "ISC2 Official Exam Prep app",
    org: "LearnZapp",
    url: "https://www.learnzapp.com",
    description: "ISC2's official study app; the free tier gives a limited set of questions and a diagnostic, full bank is paid.",
    tag: "App",
  },
  {
    name: "CISSP MindMaps & Domain Summaries",
    org: "Destination Certification",
    url: "https://destcert.com/cissp-mindmaps/",
    description: "Free mindmap videos that show how topics connect, plus downloadable PDFs and per-domain summaries (email required).",
    tag: "Mindmaps",
  },
  {
    name: "Pocket Prep CISSP",
    org: "Pocket Prep",
    url: "https://www.pocketprep.com",
    description: "Mobile question bank whose free tier includes a small set of questions plus Question of the Day, Quick 10 and Timed Quiz modes.",
    tag: "App",
  },
  {
    name: "r/cissp",
    org: "Reddit community",
    url: "https://www.reddit.com/r/cissp/",
    description: "Pass/fail write-ups, study plans and resource debates from candidates — great for morale, verify facts against the outline.",
    tag: "Community",
  },
];

/** Resources for the active study track. */
export const RESOURCES: Resource[] = byTrack({ cissp: CISSP_RESOURCES, ccsk: CCSK_RESOURCES, ctfl: CTFL_RESOURCES, ptmc: PTMC_RESOURCES });
