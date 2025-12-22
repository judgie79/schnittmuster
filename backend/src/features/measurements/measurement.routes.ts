import { Router } from "express";
import { MeasurementTypeController } from "./MeasurementTypeController";
import { PatternMeasurementController } from "./PatternMeasurementController";
import { authenticate } from "@middleware/auth";

const router = Router();
const measurementTypeController = new MeasurementTypeController();
const patternMeasurementController = new PatternMeasurementController();

router.get("/measurement-types", authenticate, measurementTypeController.list);
router.get("/measurement-types/system-defaults", authenticate, measurementTypeController.listSystemDefaults);
router.get("/measurement-types/custom", authenticate, measurementTypeController.listUserCustom);
router.get("/measurement-types/:id", authenticate, measurementTypeController.get);
router.post("/measurement-types", authenticate, measurementTypeController.create);
router.patch("/measurement-types/:id", authenticate, measurementTypeController.update);
router.delete("/measurement-types/:id", authenticate, measurementTypeController.delete);

router.get("/patterns/:patternId/measurements", authenticate, patternMeasurementController.list);
router.post("/patterns/:patternId/measurements", authenticate, patternMeasurementController.create);
router.patch("/patterns/:patternId/measurements/:measurementId", authenticate, patternMeasurementController.update);
router.delete("/patterns/:patternId/measurements/:measurementId", authenticate, patternMeasurementController.delete);

export default router;
