import { createApplication } from '@helsingborg-stad/gdi-api-node'
import { healthCheckModule } from '@helsingborg-stad/gdi-api-node'
import { swaggerModule } from '@helsingborg-stad/gdi-api-node'
import { webFrameworkModule } from '@helsingborg-stad/gdi-api-node'
import { Application } from '@helsingborg-stad/gdi-api-node/application'
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
		.use(swaggerModule({ routePrefix: '/api/v1/auth/docs/swagger' }))
		.use(healthCheckModule())
		.use(vismaAuthModule(services))
		.use(impersonationModule(services))
