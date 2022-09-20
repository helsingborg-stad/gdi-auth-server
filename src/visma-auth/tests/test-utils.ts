import { Server } from 'node:http'
import { createAuthApp } from '../../auth-app'
import { Application } from '../../framework/types'
import { createProfileService } from '../profiles'
import { createTokenService } from '../tokens'
import { AuthServices } from '../types'


const createPortPool = () => {
	let nextPort = 4444
	const acquire = async () => ++nextPort
	const release = (port: number) => {} // ports.push(port)

	return { acquire, release }
}

const portPool = createPortPool()

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
	const port = await portPool.acquire()
	const server = await application.start(port)
	try {
		await handler(server)
	} finally {
		await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve(null)))
		portPool.release(port)
	}
}

export const withAuthApplication = async (services: AuthServices, handler: (server: Server) => Promise<void>): Promise<void> => withApplication(createAuthApp(services), handler)
