import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  dialect: 'sqlite',
  storage: path.resolve(__dirname, '../../database.sqlite')
}
