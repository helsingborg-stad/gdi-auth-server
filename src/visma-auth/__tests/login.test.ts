import { StatusCodes } from 'http-status-codes'
import request from 'supertest'
import { createAuthApp } from '../../auth-app'
import { Application, ApplicationContext } from '@helsingborg-stad/gdi-api-node'
import { AuthServices } from '../types'
import { createFakeServices, notImplemented } from './test-utils'


// a simple module that prevents errors to go to console.error
const silentErrorsModule = ({ app }: ApplicationContext) => app.on('error', () => (void 0))

const createTestApp = (services: AuthServices): Application => createAuthApp({ services, validateResponse: true }).use(silentErrorsModule)

describe('GET /api/v1/auth/login', () => {
	const fakeReturn = 'https://www.example.com/ninja'

	it('redirects (302 moved temporarily) to whatever Visma says', () => createTestApp(
		createFakeServices({
			visma: {
				logout: notImplemented,
				getSession: notImplemented,
				login: async () => ({
					redirectUrl: fakeReturn,
					sessionId: 'some-fake-session-id',
				}),
			},
		}))
		.run(
			async server => {
				const fakeReturn = 'https://www.example.com/ninja'
				const { status, headers } = await request(server)
					.get('/api/v1/auth/login?redirect_url=whateverInThisStageOfProcess.com')
				expect(status).toEqual(StatusCodes.MOVED_TEMPORARILY)
				expect(headers['location']).toBe(fakeReturn)
			}))
})