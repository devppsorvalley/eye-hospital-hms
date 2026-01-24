import { DataTypes } from 'sequelize'
import sequelize from '../db/index.js'

const Patient = sequelize.define(
  'Patient',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING },
    dob: { type: DataTypes.DATEONLY },
    phone: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING }
  },
  {
    tableName: 'patients',
    timestamps: true
  }
)

export default Patient
