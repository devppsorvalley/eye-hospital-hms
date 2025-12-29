import app from './app.js'
import sequelize from './db/index.js'

const PORT = process.env.PORT || 3000

const start = async () => {
  try {
    await sequelize.authenticate()
    console.log('DB connection OK')
    await sequelize.sync()
    console.log('DB synced')
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`))
  } catch (err) {
    console.error('Failed to start server', err)
    process.exit(1)
  }
}

start()
