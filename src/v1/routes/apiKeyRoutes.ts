import { Router } from "express";
import { getApiKey } from "../../controller/apiKeyController";

const router = Router();

router.get("/", getApiKey);

export default router;
