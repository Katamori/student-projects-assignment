import config from '../../config/service'
import db from '../../microservice/database/connect'
import ManagementModel from '../../microservice/database/model/management'
import ProjectModel from '../../microservice/database/model/project'
import StudentModel from '../../microservice/database/model/student'

import path from 'path'
import { QueryTypes } from 'sequelize'
import grpc from 'grpc'
const protoLoader = require("@grpc/proto-loader")

const PROTO_PATH = path.join(__dirname, '../../proto/management.proto')

const managementModel = ManagementModel(db)
const projectModel = ProjectModel(db)
const studentModel = StudentModel(db)

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
})

const managementProto = grpc.loadPackageDefinition(packageDefinition).management

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
        // using raw query due to total incompetence on sequelize's side
        const result = await db.sequelize.query("select m.id, CONCAT(s.last_name, ' ', s.first_name) AS student_name, p.name as project_name, m.student_id, m.project_id, m.createdAt, m.updatedAt from management m left join students s on m.student_id = s.id left join projects p on m.project_id = p.id;", { 
            type: QueryTypes.SELECT 
        });

        callback(null, {
            managements: result
        })
    } catch(err) {
        console.log(err)
        callback(RES_ABORTED)
    }
}

const Create = async (call, callback) => {
    let management = call.request

    try {
        let result = await managementModel.create(management)
        
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

const Delete = async (call, callback) => {
    try {
        let id = call.request.id
        let result = await managementModel.destroy({
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
    Delete
}

server.addService(managementProto.ManagementService.service, exposedFunctions)
server.bind(config.management.host +':'+ config.management.port, grpc.ServerCredentials.createInsecure())

db.sequelize.sync().then(() => {
    console.log("Re-sync db.")
    server.start()
    console.log('Server running at ' + config.management.host +':'+ config.management.port)
})
.catch(err => {
    console.log('Can not start server at ' + config.management.host +':'+ config.management.port)
    console.log(err)
})