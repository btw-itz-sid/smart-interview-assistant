import express from "express";

import { InterviewController } from "../controllers/interview.controller";

const router = express.Router();
const controller = new InterviewController();

router.post("/answer", controller.evaluate);
export default router;