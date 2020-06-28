import config from '../../config/service'
import db from '../../microservice/database/connect'
import ManagementModel from '../../microservice/database/model/management'
import ProjectModel from '../../microservice/database/model/project'
import StudentModel from '../../microservice/database/model/student'

import path from 'path'
import { fn, col, Op, where } from 'sequelize'
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
        const result = await managementModel.findAll({
            include: [
                {
                    model: studentModel,
                    association: projectModel.belongsToMany(
                        studentModel, 
                        {
                            through: managementModel,
                            foreignKey: 'project_id',
                        }
                    )
                },
                {
                    model: projectModel,
                    association: studentModel.belongsToMany(
                        projectModel, 
                        {
                            through: managementModel,
                            foreignKey: 'student_id'
                        }
                    )
                }
            ],
            attributes: [
                'id',
                [
                    fn('CONCAT', col('students.first_name'), ' ', col('students.last_name')), 
                    'student_name'
                ],
                [
                    col('projects.name'),
                    'project_name'
                ],
                'student_id',
                'project_id',
                'createdAt',
                'updatedAt'
            ]
        })

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