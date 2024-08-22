const express = require("express");
const {
    getAllCenters,
    getCenterById,
    createCenter,
    updateCenter,
    deleteCenter,
} = require("../controllers/centre");

const centerRouter = express.Router();

// Get all centers with deep relations
centerRouter.get("/", getAllCenters);

// Get a center by ID with deep relations
centerRouter.get("/:id", getCenterById);

// Create a new center
centerRouter.post("/", createCenter);

// Update a center by ID
centerRouter.put("/:id", updateCenter);

// Delete a center by ID
centerRouter.delete("/:id", deleteCenter);

module.exports = centerRouter;
