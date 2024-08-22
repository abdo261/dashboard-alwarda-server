const express = require("express");
const {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} = require("../controllers/subject");

const subjectRouter = express.Router();

// Create a new subject
subjectRouter.post("/", createSubject);

// Get all subjects
subjectRouter.get("/", getAllSubjects);

// Get a subject by ID
subjectRouter.get("/:id", getSubjectById);

// Update a subject by ID
subjectRouter.put("/:id", updateSubject);

// Delete a subject by ID
subjectRouter.delete("/:id", deleteSubject);

module.exports = subjectRouter;
