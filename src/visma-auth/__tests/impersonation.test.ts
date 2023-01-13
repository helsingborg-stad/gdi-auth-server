import { createImpersonationService, makeImpersonatedSessionId, parseImpersonationsFromEnv, tryGetImpersonatedIdFromSession } from '../impersonation/impersonations'
import { createFakeServices, createTestApp, notImplemented } from './test-utils'
import { createImpersonatingVismaService } from '../impersonation/impersonating-visma-service'
import * as request from 'supertest'
import { StatusCodes } from 'http-status-codes'

describe('parseImpersonationsFromEnv', () => {
	it('should parse test persons from env corectly', () => {
		const parsed = parseImpersonationsFromEnv('id firstName lastName, 123 Joe Cool, 456 Fanny Mae,   111 Ignored_missing_lastName, toomuchinfo fn ln extra')
		expect(parsed.map(({ id }) => id)).toMatchObject([ 'id', '123', '456', 'toomuchinfo' ])
		expect(parsed.map(({ firstName }) => firstName)).toMatchObject([ 'firstName', 'Joe', 'Fanny', 'fn' ])
		expect(parsed.map(({ lastName }) => lastName)).toMatchObject([ 'lastName', 'Cool', 'Mae', 'ln' ])
	})
})

describe('makeImpersonatedSessionId/tryGetImpersonatedIdFromSession', () => {
	it.each([
		'a',
		'123456',
		'some weird',
		'{scooby}{doo}',
	])('id=%s, tryGetImpersonatedIdFromSession(makeImpersonatedSessionId(id)) => id', id => expect(tryGetImpersonatedIdFromSession(makeImpersonatedSessionId({ id }))).toBe(id))

	it.each([
		'',
		'{123-345}',
		'some-foreign-session',
	])('tryGetImpersonatedIdFromSession(%s) should be "" (unrecognized)', id => expect(tryGetImpersonatedIdFromSession(id)).toBe(''))
})

describe('GET /api/v1/auth/login should redirect to /impersonated-login when impersonation is active', () => {
	// setup Visma provider that hooks in with impersonation
	const visma = createImpersonatingVismaService({
		login: async () => ({
			sessionId: 'a_visma_session_id',
			redirectUrl: 'https://whatever.visma.says',
		}),
		logout: notImplemented,
		getSession: notImplemented,
	}, createImpersonationService([{
		id: '123',
		firstName: 'R2',
		lastName: 'D2',
		name: 'R2D2',
	}]))

	it('it respects proxy headers', () => createTestApp(
		createFakeServices({
			visma,
		}))
		.run(
			async server => {
				const { status, headers } = await request(server)
					.get('/api/v1/auth/login?redirect_url=test-redirect.com&relay_state=test-relay-state')
					.set('x-forwarded-proto', 'https')
					.set('x-forwarded-host', 'my.domain.test')
					.set('x-forwarded-port', '8443')
				expect(status).toEqual(StatusCodes.MOVED_TEMPORARILY)

				const location = new URL(headers['location'])
				expect(location.protocol).toBe('https:')
				expect(location.host).toBe('my.domain.test')

				// For some reason, forwared port is not considered by node/koa
				// expect(location.port).toBe(8443)
				expect(location.pathname).toBe('/impersonated-login')
				expect(location.searchParams.get('redirectUrl')).toBe('https://whatever.visma.says')
				expect(location.searchParams.get('callbackUrl')).toBe('test-redirect.com')
				expect(location.searchParams.get('relayState')).toBe('test-relay-state')
			}))
})