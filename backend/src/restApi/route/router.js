import express from 'express'
const router = express()
import student from './student'
import project from './project'

// Documentation
// https://expressjs.com/en/api.html#router

// routing for students
router.use('/student', student)

// routing for projects
router.use('/project', project)

export default router