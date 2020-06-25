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

const server = new grpc.Server()

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
