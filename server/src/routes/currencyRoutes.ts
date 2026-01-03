import express from "express";
import { convertCurrency } from "../controllers/currencyController";

const router = express.Router();

router.get("/convert", convertCurrency);

export default router;
