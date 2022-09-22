import * as request from 'supertest'

import { createFakeServices, withAuthApplication } from './test-utils'

describe('GET of unknown resources', () => {
	it('responds with 404', async () => withAuthApplication(
		createFakeServices(),
		async server => {
			const { status } = await request(server)
				.get('/some/missing/page')
				.set('Accept', 'application/json')
			expect(status).toEqual(404)        
		}))
})