import { StatusCodes } from 'http-status-codes'
import request from 'supertest'
import { SigningProfile } from '../profiles'

import { createFakeServices, createTestApp, notImplemented } from './test-utils'

describe('GET /api/v1/auth/profiles', () => {
	it('responds with JSON', async () => createTestApp(createFakeServices())
		.run(
			async server => {
				const response = await request(server)
					.get('/api/v1/auth/profiles')
					.set('Accept', 'application/json')

				expect(response.headers['content-type']).toMatch(/json/)
				expect(response.status).toEqual(StatusCodes.OK)        
			}))
	it('responds with array of SigningProfiles', async () => createTestApp(createFakeServices()).run(
		async server => {
			const { body } = await request(server)
				.get('/api/v1/auth/profiles')
				.set('Accept', 'application/json')
			expect(Array.isArray(body)).toBeTruthy()
			for(const p of (body as SigningProfile[])) {
				expect(typeof p.id).toBe('string')
			}
		}))
	it('responds with 502 bad gateway on malformed response', async () => createTestApp(
		// NOTE: This test succedds only if response validation is enabled, see createAuthApp(...)
		createFakeServices({
			profiles: {
				getBestMatchingProfile: notImplemented,
				getProfiles: () => [{ total: 'bogus' } as unknown as SigningProfile],
			},
		}))
		.run(
			async server => {
				const { status } = await request(server)
					.get('/api/v1/auth/profiles')
					.set('Accept', 'application/json')
				expect(status).toBe(StatusCodes.BAD_GATEWAY)
			}
		))
})