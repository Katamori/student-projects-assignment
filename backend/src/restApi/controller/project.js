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
                body('description').not().isEmpty(),
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

const projectList = (options) => 
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
        let result = await projectList()

        res.status(200).json(result)
    } catch(e) {
        res.json(e)
    }
}

const projectCreate = (options) => 
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
        let result = await projectCreate({
            "name":         req.body.name,
            "description":  req.body.description,
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

const projectRead = (options) => 
    new Promise((resolve, reject) => 
        client.Read(options, (error, response) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            resolve(response)
        }))

exports.read = async (req, res, next) => {
    try {
        let result = await projectRead({
            "id": req.params.id
        }) 

        res.status(200).json(result)
    } catch(e) {
        let code = e.details === 'Not found' ? 204: 500

        res.status(code).json(e)
    }
}

const projectUpdate = (options) => 
    new Promise((resolve, reject) => 
        client.Update(options, (error, response) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            resolve(response)
        }))

exports.update = async (req, res, next) => {
    try {
        let id = req.params.id

        let result = await projectUpdate({
            "id":           id,
            "name":         req.body.name,
            "description":  req.body.description
        })

        res.status(200).json({
            id: id
        })
    } catch(e) {
        let code = e.details === 'Not found' ? 204: 500

        res.status(code).json(e)
    }
}

const projectDelete = (options) => 
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
        let result = await projectDelete({
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
const projectProto = grpc.loadPackageDefinition(packageDefinition).project
const client = new projectProto.ProjectService(config.project.host +':'+ config.project.port, grpc.credentials.createInsecure())