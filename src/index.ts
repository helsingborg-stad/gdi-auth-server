import { createServicesFromEnv } from './visma-auth/services'
import { AuthServices } from './visma-auth/types'
import { createAuthApp } from './auth-app'

const services: AuthServices = createServicesFromEnv()

createAuthApp(services)
	.start(process.env.PORT || 3000)
  