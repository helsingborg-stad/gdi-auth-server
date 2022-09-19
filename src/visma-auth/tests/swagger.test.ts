import * as request from 'supertest'

import { createFakeServices, withAuthApplication } from './test-utils'

describe('GET /swagger.json', () => {
	it('responds with JSON', async () => withAuthApplication(
		createFakeServices(),
		async server => {
			const { headers, status } = await request(server)
				.get('/swagger.json')
				.set('Accept', 'application/json')
			expect(headers['content-type']).toMatch(/json/)
			expect(status).toEqual(200)        
		}))
	it('GET / redirects to /swagger', async () => withAuthApplication(
		createFakeServices(),
		async server => {
			const { status, headers } = await request(server)
				.get('/')
			expect(status).toBe(302)
			expect(headers['location']).toBe('/swagger')
		}))
	it('GET /swagger responds with HTML', async () => withAuthApplication(
		createFakeServices(),
		async server => {
			const { status, headers } = await request(server)
				.get('/swagger')
			expect(status).toBe(200)
			expect(headers['content-type']).toMatch(/html/)
		}))
})