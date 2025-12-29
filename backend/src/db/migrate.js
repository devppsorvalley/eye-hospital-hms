import sequelize from './index.js'
import User from '../models/user.model.js'
import Patient from '../models/patient.model.js'

const migrate = async () => {
  try {
    await sequelize.authenticate()
    console.log('DB authenticated')
    await sequelize.sync({ alter: true })
    console.log('DB synced (alter:true)')
    process.exit(0)
  } catch (err) {
    console.error('Migration error', err)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrate()
}

export default migrate
