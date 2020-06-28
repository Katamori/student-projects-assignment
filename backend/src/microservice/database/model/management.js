const ManagementModel = ({ sequelize, DataType }) => {

    const {INTEGER, STRING, TEXT, DATE, NOW} = DataType

    const Management = sequelize.define("management", {
        id: {
            type: INTEGER, 
            primaryKey: true, 
            autoIncrement: true
        },
        student_id: {
            type: INTEGER,
            references: {
                model: 'student',
                key: 'id'
            }
        },
        project_id: {
            type: INTEGER, 
            references: {
                model: 'project',
                key: 'id'
            }
        },
        createdAt: {
            type: DATE,
            defaultValue: NOW
        }
    })
    return Management;
}

export default ManagementModel