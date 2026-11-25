import type { Reference } from "@/lib/types";

/**
 * Official sources for the ISTQB CTFL and AT*SQA Performance Testing tracks.
 *
 * Page numbers: CTFL v4.0.1 and CT-PT 2018 pages are the printed "Page N of 78/59" footers, which
 * match the PDF page number, so `#page=N` links open on the cited page. The AT*SQA Performance
 * Testing Body of Knowledge numbers its pages in the footer (cover = page 1); its printed table of
 * contents is one lower than the footers (e.g. ToC "5 Introduction" is footer page 6). This app
 * always cites the footer / PDF page.
 */
export const ISTQB_DOCS = {
  ctfl: {
    title: "ISTQB Certified Tester Foundation Level Syllabus v4.0.1",
    publisher: "ISTQB · v4.0.1, 15 Sep 2024 (78 pages)",
    url: "https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf",
  },
  ptmc: {
    title: "AT*SQA Performance Testing Micro-Credential Body of Knowledge (Syllabus)",
    publisher: "AT*SQA · 21 pages, 200 min study time",
    url: "https://atsqa.org/assets/documents/Performance-Testing-Micro-Credentials.pdf",
  },
  ctpt: {
    title: "ISTQB Certified Tester Performance Testing (CT-PT) Syllabus v1.0",
    publisher: "ISTQB · Version 2018, 9 Dec 2018 (59 pages)",
    url: "https://www.istqb.org/wp-content/uploads/2024/11/ISTQB-CT-PT_Syllabus_v1.0_2018.pdf",
  },
  examTables: {
    title: "ISTQB Exam Structure and Rules Tables v1.18",
    publisher: "ISTQB · 2026 (question counts per chapter and K-level)",
    url: "https://istqb.org/wp-content/uploads/2026/05/ISTQB_Exam-Structure-and-Rules-Tables_v1.18.pdf",
  },
  ctflPage: {
    title: "ISTQB CTFL v4.0 certification page (syllabus, sample exams A–D, exam structure)",
    publisher: "ISTQB",
    url: "https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0",
  },
  ctptPage: {
    title: "ISTQB CT-PT certification page (syllabus, sample exam A v1.3)",
    publisher: "ISTQB",
    url: "https://www.istqb.org/certifications/performance-tester",
  },
  ptmcPage: {
    title: "AT*SQA Performance Testing Micro-Credential",
    publisher: "AT*SQA (10 questions, 20 minutes, open book, two attempts)",
    url: "https://atsqa.org/micro-credentials/performance-testing",
  },
  ptmcFormat: {
    title: "AT*SQA: Micro-Credentials, the first step toward certification (exam format FAQ)",
    publisher: "AT*SQA",
    url: "https://atsqa.org/micro-credentials-first-step",
  },
  glossary: {
    title: "ISTQB Glossary of Software Testing Terms",
    publisher: "ISTQB",
    url: "https://glossary.istqb.org/",
  },
};

export type IstqbDoc = keyof typeof ISTQB_DOCS;

/** A citation to an exact page of a syllabus, with a PDF link that opens on that page. */
export function pageRef(doc: "ctfl" | "ptmc" | "ctpt", section: string, page: number | [number, number], note?: string): Reference {
  const d = ISTQB_DOCS[doc];
  const [p1, p2] = Array.isArray(page) ? page : [page, page];
  const pages = p1 === p2 ? `p. ${p1}` : `pp. ${p1}–${p2}`;
  return {
    kind: doc === "ctpt" ? "industry" : "book",
    title: `${d.title} — ${section}, ${pages}`,
    publisher: note ? `${d.publisher} · ${note}` : d.publisher,
    url: `${d.url}#page=${p1}`,
  };
}

export function docRef(doc: IstqbDoc, kind: Reference["kind"] = "industry"): Reference {
  return { kind, ...ISTQB_DOCS[doc] };
}
