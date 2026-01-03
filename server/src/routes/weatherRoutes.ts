import express from "express";
import { getWeather } from "../controllers/weatherController";

const router = express.Router();

router.get("/", getWeather);

export default router;
