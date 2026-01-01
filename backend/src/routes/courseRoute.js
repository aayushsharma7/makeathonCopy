import express from "express"
import { courseController, getCourse, getCourseData, getVideo } from "../controllers/course.controller.js";

const router = express.Router()

router.post('/', courseController);

router.get('/:owner', getCourse);

router.get('/data/:id', getCourseData)

router.get('/video/:id', getVideo)

export default router;