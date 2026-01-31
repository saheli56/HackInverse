export function isRelevantPage(): boolean {
  const url = window.location.href.toLowerCase();
  const title = document.title.toLowerCase();
  const bodyText = document.body?.innerText?.toLowerCase() || "";
  const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
    .map((el) => el.textContent?.toLowerCase() || "")
    .join(" ");

  const urlKeywords = [
    "terms",
    "privacy",
    "policy",
    "legal",
    "agreement",
    "conditions",
    "tos",
    "gdpr",
    "eula",
    "license",
    "disclaimer",
    "cookie",
    "consent",
    "compliance",
  ];

  const contentKeywords = [
    "terms of service",
    "terms of use",
    "privacy policy",
    "user agreement",
    "license agreement",
    "end user license",
    "terms and conditions",
    "cookie policy",
    "data protection",
    "acceptable use",
    "service agreement",
    "subscription terms",
    "cancellation policy",
    "refund policy",
  ];

  const hasUrlMatch = urlKeywords.some((keyword) => url.includes(keyword));
  const hasTitleMatch = contentKeywords.some((keyword) => title.includes(keyword));
  const hasHeadingMatch = contentKeywords.some((keyword) => headings.includes(keyword));

  if (hasUrlMatch || hasTitleMatch || hasHeadingMatch) {
    return true;
  }

  const bodyTextSample = bodyText.substring(0, 3000);
  const legalPhrases = [
    "you agree to",
    "by using this",
    "these terms",
    "this agreement",
    "user agrees",
    "we collect",
    "your data",
    "personal information",
    "we may share",
    "third parties",
    "arbitration",
    "governing law",
    "intellectual property",
    "disclaims all",
    "limitation of liability",
  ];

  const phraseMatches = legalPhrases.filter((phrase) =>
    bodyTextSample.includes(phrase)
  ).length;

  return phraseMatches >= 3;
}
