import config from '../../config/service'

import { body, validationResult } from 'express-validator'
import path from 'path'
import grpc from 'grpc'
const protoLoader = require("@grpc/proto-loader")

const PROTO_PATH = path.join(__dirname, '../../proto/management.proto')

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
                body('student_id').not().isEmpty(),
                body('project_id').not().isEmpty(),
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

const managementList = (options) => 
    new Promise((resolve, reject) => 
        client.List(options, (error, response) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            resolve(response)
        }))

exports.list = async (req, res, next) => {
    try {
        let result = await managementList()

        res.status(200).json(result)
    } catch(e) {
        res.json(e)
    }
}

const managementCreate = (options) => 
    new Promise((resolve, reject) => 
        client.Create(options, (error, response) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            resolve(response)
        }))

exports.create = async (req, res, next) => {
    try {
        let result = await managementCreate({
            "student_id":   req.body.student_id,
            "project_id":   req.body.project_id,
        })

        res.status(201).json(result)
    } catch(err) {
        switch(err?.details) {
            case 'ALREADY_EXISTS':
                res.status(409).json({
                    error: err.metadata.getMap()
                })
                break
            default:
                res.status(500).json(err)
        }
    }
}

const managementDelete = (options) => 
    new Promise((resolve, reject) => 
        client.Delete(options, (error, response) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            resolve(response)
        }))

exports.delete = async (req, res, next) => {
    try{
        let id = req.params.id
        let result = await managementDelete({
            "id": id
        })

        res.status(200).json({
            id: id
        })
    } catch(e){
        let code = e.details === 'Not found' ? 204: 500

        res.status(code).json(e)
    }
}

// Create gRPC client
const managementProto = grpc.loadPackageDefinition(packageDefinition).management
const client = new managementProto.ManagementService(config.management.host +':'+ config.management.port, grpc.credentials.createInsecure())