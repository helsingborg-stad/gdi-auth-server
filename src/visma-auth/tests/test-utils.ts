import { Server } from 'node:http'
import { createAuthApp } from '../../auth-app'
import { Application, ApplicationContext } from '../../framework/types'
import { createProfileService } from '../profiles'
import { createTokenService } from '../tokens'
import { AuthServices } from '../types'

const TEST_PORT = 4444

// a simple module that prevents errors to go to console.error
const silentErrorsModule = ({ app }: ApplicationContext) => app.on('error', () => (void 0))

export const notImplemented = () => { throw new Error('not implemented') }

export const createFakeServices = (patch: Partial<AuthServices> = null): AuthServices => ({
	profiles: createProfileService({
		claims: {
			issuer: 'test issuer',
			audience: 'test audience',
			expiresIn: '1 day',
			notBefore: '0s',
			subject: '',
		} }),
	tokens: createTokenService({ secretKey: 'test secret key' }),
	visma: {
		login: notImplemented,
		getSession: notImplemented,
	},
	...patch,
})

export const withApplication = async (application: Application, handler: (server: Server) => Promise<void>): Promise<void> => {
	const server = await application.start(TEST_PORT)
	try {
		await handler(server)
	} finally {
		await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve(null)))
	}
}

export const withAuthApplication = async (services: AuthServices, handler: (server: Server) => Promise<void>): Promise<void> => withApplication(
	createAuthApp({ services, validateResponse: true }).use(silentErrorsModule),
	handler)
