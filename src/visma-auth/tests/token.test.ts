import * as request from 'supertest'
import { createFakeServices, withAuthApplication } from './test-utils'
import * as jwt from 'jsonwebtoken'


describe('GET /api/v1/auth/token', () => {
	it('validates its parameters', async () => withAuthApplication(
		createFakeServices(),
		async server => {
			const response = await request(server)
				.get('/api/v1/auth/token?totallyWrongInput=123')
				.set('Accept', 'application/json')
			expect(response.status).toEqual(400)   
		}))
	it('returns 401 when Visma reports error', async () => withAuthApplication(
		createFakeServices({
			visma: {
				login: async () => { throw new Error ('not implemented') },
				getSession: async ({ sessionId }) => ({
					sessionId,
					session: 'some internal stuff',
					error: {
						code: '123',
						message: 'fake error',
					},
				}),
			},
		}),
		async server => {
			const response = await request(server)
				.get('/api/v1/auth/token?ts_session_id=test-id-123')
				.set('Accept', 'application/json')
			expect(response.status).toEqual(401)
		}))
	it('returns 401 when no user.id is returned from Visma', async () => withAuthApplication(
		createFakeServices({
			visma: {
				login: async () => { throw new Error ('not implemented') },
				getSession: async ({ sessionId }) => ({
					sessionId,
					session: 'some internal stuff',
					user: {
						id: '',
					},
				}),
			},
		}),
		async server => {
			const response = await request(server)
				.get('/api/v1/auth/token?ts_session_id=test-id-123')
				.set('Accept', 'application/json')
			expect(response.status).toEqual(401)
		}))
	it('validates creates a signed JWT', async () => withAuthApplication(
		createFakeServices({
			visma: {
				login: async () => { throw new Error ('not implemented') },
				getSession: async ({ sessionId }) => ({
					sessionId,
					session: 'some internal stuff',
					user: {
						id: '19710320-1234',
						name: 'Anders Andersson',
					},
				}),
			},
		}),
		async server => {
			const { status, body: { accessToken, refreshToken } } = await request(server)
				.get('/api/v1/auth/token?ts_session_id=test-id-123')
				.set('Accept', 'application/json')
			expect(status).toEqual(200)
			expect(accessToken).toMatch(/.+/)
			expect(refreshToken).toMatch(/.+/)

			const verified = await jwt.verify(accessToken, 'test shared secret key')
			expect(verified).toMatchObject({
				id: '19710320-1234',
				name: 'Anders Andersson',
				aud: 'test audience',
				iss: 'test issuer',
				sub: 'id://19710320-1234',
			})
		}))
    
})