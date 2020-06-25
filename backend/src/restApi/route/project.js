import project from '../controller/project'
import express from 'express'

const router = express.Router()

// GET / -> list
router.get('/', project.list)

// POST / -> create
router.post('/', project.validationRules('create'), project.validate, project.create)

// GET /<int> -> read
router.get('/:id', project.read)

// PUT /<int> -> update
router.put('/:id', project.update)

// DELETE /<int> -> delete
router.delete('/:id', project.delete)

export default router