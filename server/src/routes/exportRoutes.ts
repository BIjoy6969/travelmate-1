import express from "express";
import { exportTripPDF } from "../controllers/exportController";

const router = express.Router();

router.get("/pdf", exportTripPDF);

export default router;
