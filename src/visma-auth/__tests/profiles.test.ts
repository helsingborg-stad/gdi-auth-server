import * as request from 'supertest'
import { SigningProfile } from '../profiles'

import { createFakeServices, notImplemented, withAuthApplication } from './test-utils'

describe('GET /api/v1/auth/profiles', () => {
	it('responds with JSON', async () => withAuthApplication(
		createFakeServices(),
		async server => {
			const response = await request(server)
				.get('/api/v1/auth/profiles')
				.set('Accept', 'application/json')

			expect(response.headers['content-type']).toMatch(/json/)
			expect(response.status).toEqual(200)        
		}))
	it('responds with array of SigningProfiles', async () => withAuthApplication(
		createFakeServices(),
		async server => {
			const { body } = await request(server)
				.get('/api/v1/auth/profiles')
				.set('Accept', 'application/json')
			expect(Array.isArray(body)).toBeTruthy()
			for(const p of (body as SigningProfile[])) {
				expect(typeof p.id).toBe('string')
			}
		}))
	it('responds with 502 on malformed response', async () => withAuthApplication(
		// NOTE: This test succedds only if response validation is enabled, see createAuthApp(...)
		createFakeServices({
			profiles: {
				getBestMatchingProfile: notImplemented,
				getProfiles: () => [{ total: 'bogus' } as unknown as SigningProfile],
			},
		}),
		async server => {
			const { status } = await request(server)
				.get('/api/v1/auth/profiles')
				.set('Accept', 'application/json')
			expect(status).toBe(502)
		}
	))
})