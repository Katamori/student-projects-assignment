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



// Definitions
const List = async (call, callback) => {
    // todo
}

const Read = async (call, callback) => {
    // todo
}

const Create = async (call, callback) => {
    // todo
}

const Update = async (call, callback) => {
    // todo
}

const Delete = async (call, callback) => {
    // todo
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