/* =========================================================
   E-LIBRARY - SHARED BOOK CATALOG
   One list of books used by Browse Books, Search, Favorites,
   and Book Details, so every page shows the same data.
   ========================================================= */

const BOOKS = [
  { id: 1, title: "Python Programming", author: "Mark Lutz", category: "Programming",
    cover: "PYTHON PROGRAMMING", status: "available",
    description: "A complete guide to Python, covering syntax, data structures, functions and modules for building real programs." },

  { id: 2, title: "Data Mining Basics", author: "Academic Press", category: "Computer Science",
    cover: "DATA MINING", status: "borrowed", dueDate: "2026-09-24",
    description: "An introduction to extracting useful patterns and information from large datasets." },

  { id: 3, title: "Artificial Intelligence", author: "Stuart Russell", category: "Science",
    cover: "ARTIFICIAL INTELLIGENCE", status: "available",
    description: "A foundational text covering search, knowledge representation, learning and reasoning in AI systems." },

  { id: 4, title: "Database Systems", author: "Korth", category: "Programming",
    cover: "DATABASE SYSTEMS", status: "reserved", dueDate: "2026-09-20",
    description: "Covers relational database design, SQL, normalization and transaction management." },

  { id: 5, title: "Engineering Mathematics", author: "Academic Collection", category: "Mathematics",
    cover: "MATHEMATICS", status: "available",
    description: "Core mathematical methods used across engineering and computer science coursework." },

  { id: 6, title: "World History", author: "Reference Collection", category: "History",
    cover: "WORLD HISTORY", status: "available",
    description: "A reference overview of major civilizations, events and turning points across world history." }
];

/* Find one book by its id (works with numbers or numeric strings) */
function getBookById(id) {
  return BOOKS.find(b => b.id === Number(id));
}

/* Turn a status code into a readable label */
function statusLabel(status) {
  if (status === "available") return "Available";
  if (status === "borrowed") return "Borrowed";
  if (status === "reserved") return "Reserved";
  return status;
}
