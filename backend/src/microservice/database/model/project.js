import StudentModel from './student'

const ProjectModel = ({
    sequelize, 
    DataType
  }) => {
  const {INTEGER, STRING, TEXT, DATE, NOW} = DataType
  const Project = sequelize.define("project", {
    id: {
      type: INTEGER, 
      primaryKey: true, 
      autoIncrement: true
    },
    name: {
      type: STRING,
      unique: true,
      allowNull: false
    },
    description: {
      type: TEXT
    },
    createdAt: {
      type: DATE,
      defaultValue: NOW
    }
  })

  Project.belongsToMany(
    StudentModel, 
    {
      through: 'management',
      foreignKey: 'project_id',
      otherKey: 'student_id'
    }
  )

  return Project;
}
  
export default ProjectModel