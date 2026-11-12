import { Router } from "express";
import { deleteRecord, getAllRecords, getRecord, patchRecord, postRecord } from "../../controller/recordController";

const router: Router = Router();
router.get("/", getAllRecords);
router.get("/:id", getRecord);
router.post("/", postRecord);
router.patch("/:id", patchRecord);
router.delete("/:id", deleteRecord);

export default router;
