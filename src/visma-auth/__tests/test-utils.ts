import { createAuthApp } from '../../auth-app'
import { Application, ApplicationContext } from '@helsingborg-stad/gdi-api-node'
import { createImpersonationService } from '../impersonation/impersonations'
import { createProfileService } from '../profiles'
import { createNullRefreshTokenRepository } from '../refresh-tokens'
import { createTokenService } from '../tokens'
import { AuthServices } from '../types'

// a simple module that prevents errors to go to console.error
const silentErrorsModule = ({ app }: ApplicationContext) => app.on('error', () => (void 0))

export const notImplemented = (): any => { throw new Error('not implemented') }

export const createFakeServices = (patch: Partial<AuthServices> | null = null): AuthServices => ({
	impersonations: createImpersonationService([]),
	profiles: createProfileService({
		claims: {
			issuer: 'test issuer',
			audience: 'test audience',
			expiresIn: '1 day',
			notBefore: '0s',
			subject: '',
		} }),
	tokens: createTokenService({
		sharedSecretKey: 'test shared secret key',
		privateSecretKey: 'test private secret key',
		refreshTokens: createNullRefreshTokenRepository(),
	}),
	visma: {
		login: notImplemented,
		logout: notImplemented,
		getSession: notImplemented,
	},
	...patch,
})

export const createTestApp = (services: AuthServices): Application => createAuthApp({ services, validateResponse: true }).use(silentErrorsModule)
