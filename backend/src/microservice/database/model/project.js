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

  return Project;
}
  
export default ProjectModel