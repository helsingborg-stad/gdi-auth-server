import * as request from 'supertest'
import { createFakeServices, createTestApp } from './test-utils'
import * as jwt from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'

const notImplemented = () => { throw new Error('not implemented') }

describe('GET /api/v1/auth/token', () => {
	it('return 400 bad request on parameter validation failure', async () => createTestApp(createFakeServices())
		.run(async server => {
			const response = await request(server)
				.get('/api/v1/auth/token?totallyWrongInput=123')
				.set('Accept', 'application/json')
			expect(response.status).toEqual(StatusCodes.BAD_REQUEST)   
		}))
	it('returns 401 unauthorized when Visma reports error', async () => createTestApp(
		createFakeServices({
			visma: {
				login: notImplemented,
				logout: notImplemented,
				getSession: async ({ sessionId }) => ({
					sessionId,
					session: 'some internal stuff',
					error: {
						code: '123',
						message: 'fake error',
					},
				}),
			},
		}))
		.run(async server => {
			const response = await request(server)
				.get('/api/v1/auth/token?ts_session_id=test-id-123')
				.set('Accept', 'application/json')
			expect(response.status).toEqual(StatusCodes.UNAUTHORIZED)
		}))
	it('returns 401 unauthorized when no user.id is returned from Visma', async () => createTestApp(createFakeServices({
		visma: {
			login: notImplemented,
			logout: notImplemented,
			getSession: async ({ sessionId }) => ({
				sessionId,
				session: 'some internal stuff',
				user: {
					id: '',
				},
			}),
		} }))
		.run(async server => {
			const response = await request(server)
				.get('/api/v1/auth/token?ts_session_id=test-id-123')
				.set('Accept', 'application/json')
			expect(response.status).toEqual(StatusCodes.UNAUTHORIZED)
		}))
	it('validates creates a signed JWT', async () => createTestApp(createFakeServices({
		visma: {
			login: notImplemented,
			logout: notImplemented,
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
			const { status, body: { accessToken, refreshToken } } = await request(server)
				.get('/api/v1/auth/token?ts_session_id=test-id-123')
				.set('Accept', 'application/json')
			expect(status).toEqual(StatusCodes.OK)
			expect(accessToken).toMatch(/.+/)
			expect(refreshToken).toMatch(/.+/)

			const verified = await jwt.verify(accessToken, 'test shared secret key')
			expect(verified).toMatchObject({
				id: '19710320-1234',
				name: 'Anders Andersson',
				sessionId: 'test-id-123',
				aud: 'test audience',
				iss: 'test issuer',
				sub: 'id://19710320-1234',
			})
		}))
    
})