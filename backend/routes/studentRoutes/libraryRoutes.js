const express = require("express");
const auth = require("../../middleware/authMiddleware");

const router = express.Router();

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 30;
const CATEGORY_LABEL_MAP = {
  computer_science: "computer science",
  mathematics: "mathematics",
  physics: "physics",
  psychology: "psychology",
  business: "business",
  biology: "biology",
  history: "history",
  literature: "literature",
  art: "art",
  music: "music",
};

const toNumberOr = (value, fallback) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isCategoryMatch = (subjects, category) => {
  const normalizedCategory = normalize(category);
  if (!normalizedCategory) {
    return true;
  }

  const normalizedSubjects = (Array.isArray(subjects) ? subjects : []).map(normalize);
  return normalizedSubjects.some(
    (subject) =>
      subject === normalizedCategory ||
      subject.includes(normalizedCategory) ||
      normalizedCategory.includes(subject)
  );
};

router.get("/search", auth, async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();
    const category = String(req.query.category || "").trim().toLowerCase();

    if (!query && !category) {
      return res.status(400).json({ message: "Search query or category is required" });
    }

    const page = Math.max(toNumberOr(req.query.page, 1), 1);
    const limit = Math.min(Math.max(toNumberOr(req.query.limit, DEFAULT_LIMIT), 1), MAX_LIMIT);

    const normalizedCategory = normalize(category);
    const queryText = query || "*";

    const params = new URLSearchParams({
      q: queryText,
      page: String(page),
      limit: String(limit),
      fields: "key,title,author_name,first_publish_year,cover_i,edition_count,language,subject",
    });

    if (normalizedCategory) {
      params.set("subject", normalizedCategory);
    }

    const response = await fetch(`https://openlibrary.org/search.json?${params.toString()}`);

    if (!response.ok) {
      return res.status(502).json({ message: "OpenLibrary request failed" });
    }

    const data = await response.json();
    const docs = Array.isArray(data.docs) ? data.docs : [];
    const filteredDocs = normalizedCategory
      ? docs.filter((doc) => isCategoryMatch(doc.subject, normalizedCategory))
      : docs;

    const items = filteredDocs.map((doc) => ({
      id: doc.key || "",
      title: doc.title || "Untitled",
      authors: Array.isArray(doc.author_name) ? doc.author_name : [],
      firstPublishYear: doc.first_publish_year || null,
      editionCount: doc.edition_count || 0,
      languages: Array.isArray(doc.language) ? doc.language : [],
      subjects: Array.isArray(doc.subject) ? doc.subject : [],
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : null,
      openLibraryUrl: doc.key ? `https://openlibrary.org${doc.key}` : null,
    }));

    res.json({
      query,
      category,
      categoryLabel: CATEGORY_LABEL_MAP[category] || category || "",
      page,
      limit,
      total: data.numFound || 0,
      items,
    });
  } catch (err) {
    console.error("ONLINE_LIBRARY_SEARCH_ERROR:", err);
    res.status(500).json({ message: "Failed to search OpenLibrary" });
  }
});

module.exports = router;