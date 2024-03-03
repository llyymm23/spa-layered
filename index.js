import express from 'express';
import authMiddleware from "./middlewares/need-signin.middlewares.js";;

import { UsersController } from './src/controller/users.controller.js';
import { ResumeController } from './src/controller/resume.controller.js';

const router = express.Router();

const usersController = new UsersController();
const resumeController = new ResumeController();

router.post('/sign-up', usersController.signUp);
router.post('/sign-in', usersController.signIn);
router.get('/users', authMiddleware, usersController.getUsers);

router.get('/resumes', resumeController.getResumes);
router.get('/resumes/:resumeId', resumeController.getResume);
router.post('/resumes', authMiddleware, resumeController.createResume);
router.patch('/resumes/:resumeId', authMiddleware, resumeController.patchResume);
router.delete('/resumes/:resumeId', authMiddleware, resumeController.deleteResume);


export default router;