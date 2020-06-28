import management from '../controller/management'
import express from 'express'

const router = express.Router()

// GET / -> list
router.get('/', management.list)

// POST / -> create
router.post('/', management.validationRules('create'), management.validate, management.create)

// DELETE /<int> -> delete
router.delete('/:id', management.delete)

export default router