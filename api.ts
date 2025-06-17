import { app } from './server/server'

export default defineNitroPlugin(() => {
  return app
}) 