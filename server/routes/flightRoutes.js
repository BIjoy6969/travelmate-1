import express from "express";
import {
  getAllFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight,
} from "../controllers/flightController.js";

const router = express.Router();

router.get("/", getAllFlights);
router.get("/:id", getFlightById);
router.post("/", createFlight);
router.put("/:id", updateFlight);
router.delete("/:id", deleteFlight);

export default router;

