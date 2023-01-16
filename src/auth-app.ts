import { createApplication } from './framework'
import { healthCheckModule } from './framework/modules/healthcheck-module.ts'
import swaggerModule from './framework/modules/swagger-module'
import webFrameworkModule from './framework/modules/web-framework-module'
import { Application } from './framework/types'
import { impersonationModule } from './visma-auth/impersonation/impersonation-module'
import { AuthServices } from './visma-auth/types'
import vismaAuthModule from './visma-auth/visma-auth-module'

export const createAuthApp = ({ services, validateResponse }: {services: AuthServices, validateResponse?: boolean}): Application =>
	createApplication({
		openApiDefinitionPath: './openapi.yml',
		validateResponse,
	})
		.use(({ app }) => { app.proxy = true })
		.use(webFrameworkModule())
		.use(swaggerModule())
		.use(healthCheckModule())
		.use(vismaAuthModule(services))
		.use(impersonationModule(services))
