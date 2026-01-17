import express from "express"
import { courseController, getAi, getCourse, getCourseData, getVideo } from "../controllers/course.controller.js";
import { authCheck } from "../middlewares/authCheck.js";

const router = express.Router()

router.post('/create', authCheck, courseController);

router.get('/', authCheck, getCourse);

router.get('/data/:id', getCourseData)

router.get('/video/:id', getVideo)
router.post('/ai', getAi)

export default router;