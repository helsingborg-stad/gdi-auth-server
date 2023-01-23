import request from 'supertest'
import { createFakeServices, createTestApp } from './test-utils'
import { StatusCodes } from 'http-status-codes'

const notImplemented = () => { throw new Error('not implemented') }

describe('POST /api/v1/auth/logout/<token>', () => {
	it('attempts to logout from visma', async () => {
		const sessions: Record<string, number> = {}
		await createTestApp(createFakeServices({
			visma: {
				login: notImplemented,
				logout: async ({ sessionId }) => (--sessions[sessionId], void 0),
				getSession: async ({ sessionId }) => ({
					sessionId,
					session: 'some internal stuff',
					user: {
						id: '19710320-1234',
						name: 'Anders Andersson',
					},
				}),
			} }))
			.run(async server => {
				// get access token
				const { body: { accessToken } } = await request(server)
					.get('/api/v1/auth/token?ts_session_id=test-id-123')
					.set('Accept', 'application/json')

				// Register session so we can assert that it is killed
				sessions['test-id-123'] = 1
				
				// logout using token
				const { status } = await request(server)
					.get(`/api/v1/auth/logout?token=${accessToken}`)
					.set('Accept', 'application/json')

				expect(status).toEqual(StatusCodes.OK)
			})
		expect(sessions['test-id-123']).toBe(0)
	})

	it('fails with BAD_REQUEST on bad token', async () => createTestApp(createFakeServices({
		visma: {
			login: notImplemented,
			logout: notImplemented,
			getSession: notImplemented,
		} }))
		.run(async server => {
			// logout using token
			const { status } = await request(server)
				.get('/api/v1/auth/logout?token=A-BAD-TOKEN')
				.set('Accept', 'application/json')
	
			expect(status).toEqual(StatusCodes.BAD_REQUEST)
		}))
})