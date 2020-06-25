import config from '../../config/service'

import { body, validationResult } from 'express-validator'
import path from 'path'
import grpc from 'grpc'
const protoLoader = require("@grpc/proto-loader")

const PROTO_PATH = path.join(__dirname, '../../proto/project.proto')

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
})

exports.validationRules = (method) => {
    switch (method) {
        case 'create':
            return [
                body('name').not().isEmpty(),
                body('desc').not().isEmpty(),
            ]
        default:
            break
    }
}

exports.validate = (req, res, next) => {
    const errors = validationResult(req)

    if (errors.isEmpty()) {
        return next()
    }

    const extractedErrors = []

    errors.array().map(err => extractedErrors.push({
        [err.param]: err.msg
    }))
  
    return res.status(400).json({
        errors: extractedErrors
    })
}

exports.list = async (req, res, next) => {
    // todo
}

exports.create = async (req, res, next) => {
    // todo
}

exports.read = async (req, res, next) => {
    // todo
}

exports.update = async (req, res, next) => {
    // todo
}

exports.delete = async (req, res, next) => {
    // todo
}

// Create gRPC client
const projectProto = grpc.loadPackageDefinition(packageDefinition).project
const client = new projectProto.ProjectService(config.project.host +':'+ config.project.port, grpc.credentials.createInsecure())