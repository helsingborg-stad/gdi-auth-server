import * as request from 'supertest'
import { createFakeServices, notImplemented, withAuthApplication } from './test-utils'

describe('GET /api/v1/auth/login', () => {
	const fakeReturn = 'https://www.example.com/ninja'

	it('redirects to whatever Visma says', () => withAuthApplication(
		createFakeServices({
			visma: {
				getSession: notImplemented,
				login: async () => ({
					redirectUrl: fakeReturn,
					sessionId: 'some-fake-session-id',
				}),
			},
		}),
		async server => {
			const fakeReturn = 'https://www.example.com/ninja'
			const { status, headers } = await request(server)
				.get('/api/v1/auth/login?redirectUrl=whateverInThisStageOfProcess.com')
			expect(status).toEqual(302)
			expect(headers['location']).toBe(fakeReturn)
		}))
})