import config from '../../config/service'
import db from '../../microservice/database/connect'
import ProjectModel from '../../microservice/database/model/project'

import path from 'path'
import grpc from 'grpc'
const protoLoader = require("@grpc/proto-loader")

const PROTO_PATH = path.join(__dirname, '../../proto/project.proto')

const projectModel = ProjectModel(db)

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
})

const projectProto = grpc.loadPackageDefinition(packageDefinition).project

// Frequently used response objects
const RES_ABORTED = {
    code: grpc.status.ABORTED,
    details: "Aborted"
}

const RES_NOTFOUND = {
    code: grpc.status.NOT_FOUND,
    details: "Not found"
}

// Definitions
const List = async (call, callback) => {
    try {
        const result = await projectModel.findAll()

        callback(null, {
            projects: result
        })
    } catch(err) {
        callback(RES_ABORTED)
    }
}

const Read = async (call, callback) => {
    try {
        let id = call.request.id
        let result = await studentModel.findByPk(id)

        if (!result) {
            callback(RES_NOTFOUND)
        }

        callback(null, result)
    } catch(err) {
        callback(RES_ABORTED)
    }
}

const Create = async (call, callback) => {
    let project = call.request

    try {
        let result = await projectModel.create(project)
        
        callback(null, result)
    } catch(err) {
        switch(err.name) {
            case 'SequelizeUniqueConstraintError':
                let jsErr = new Error('ALREADY_EXISTS')

                jsErr.code = grpc.status.ALREADY_EXISTS
                jsErr.metadata = dbErrorCollector({errors: err.errors})

                callback(jsErr)
                break
            default:
                callback(RES_ABORTED)
        }
    }
}

const Update = async (call, callback) => {
    try {
        let project = call.request

        let newValues = {
            "name":     project.name, 
            "desc":     project.desc
        }

        let affectedRows = await projectModel.update(newValues, {
            where: {
                id: project.id
            }
        })

        if (affectedRows.length < 1) {
            callback(RES_NOTFOUND)
        }

        callback(null, affectedRows)
    } catch(err) {
        callback(RES_ABORTED)
    }
}

const Delete = async (call, callback) => {
    try {
        let id = call.request.id
        let result = await projectModel.destroy({
            where: {
                "id": id
            }
        })

        if (!result) {
            callback(RES_NOTFOUND)
        }

        callback(null, result)
    } catch(err) {
        callback(RES_ABORTED)
    }
}

// Collect errors
const dbErrorCollector=({ errors }) => {
    const metadata = new grpc.Metadata()

    const error = errors.map(item => {
        metadata.set(item.path, item.type)
    })

    return metadata
}

// Server initialization
const server = new grpc.Server()

const exposedFunctions = {
    List,
    Create,
    Read,
    Update,
    Delete
}

server.addService(projectProto.ProjectService.service, exposedFunctions)
server.bind(config.project.host +':'+ config.project.port, grpc.ServerCredentials.createInsecure())

db.sequelize.sync().then(() => {
    console.log("Re-sync db.")
    server.start()
    console.log('Server running at ' + config.project.host +':'+ config.project.port)
})
.catch(err => {
    console.log('Can not start server at ' + config.project.host +':'+ config.project.port)
    console.log(err)
})