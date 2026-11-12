import { Router } from "express";
import type{Express,Request,Response} from "express";
import { deleteWorkout, getAllWorkouts, getWorkouts, patchWorkout, postWorkout } from "../../controller/controller";


const router:Router = Router();
router.get("/",getAllWorkouts);
router.get("/:id",getWorkouts);
router.post("/",postWorkout);
router.patch("/:id",patchWorkout);
router.delete("/:id",deleteWorkout)

export default router;

