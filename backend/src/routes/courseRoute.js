import express from "express"
import { courseController, getCourse, getCourseData, getVideo } from "../controllers/course.controller.js";
import { authCheck } from "../middlewares/authCheck.js";

const router = express.Router()

router.post('/create/:owner', authCheck, courseController);

router.get('/:owner', authCheck, getCourse);

router.get('/data/:id', getCourseData)

router.get('/video/:id', getVideo)

export default router;