import { Router } from "express";
import { authenticate } from "@middleware/auth";
import { fileController } from "./FileController";

const router: Router = Router();

router.use(authenticate);
router.get("/:identifier", fileController.getFile);
router.head("/:identifier", fileController.getFile);

export const fileRouter: Router = router;
export default router;
