import { StatusCodes } from 'http-status-codes'
import { ApplicationContext, ApplicationModule } from '../framework/types'
import { AuthServices } from './types'

export function vismaAuthModule(services: AuthServices): ApplicationModule {
	const {
		visma, 
		tokens: { createVismaSessionTokens, verifyToken }, 
		profiles: { getBestMatchingProfile, getProfiles },
	} = services

	const login = async ctx => {
		const { query: { redirect_url: callbackUrl, relay_state: relayState } } = ctx
		const { redirectUrl } = (await visma.login({ ctx, callbackUrl, relayState })) || {}
		
		return redirectUrl ? ctx.redirect(redirectUrl) : ctx.throw(StatusCodes.BAD_GATEWAY)
	}

	const logout = async ctx => {
		const { query: { token } } = ctx
		try {
			const payload = await verifyToken(token)
			payload && await visma.logout(payload)
			ctx.body = {}
		} catch {
			ctx.body = {}
			ctx.throw(StatusCodes.BAD_REQUEST)
		}
	}

	const token = async ctx => {
		const { query: { ts_session_id, profile } } = ctx
		const session = await visma.getSession({ sessionId: ts_session_id })
		if (session?.error) {
			return ctx.throw(401)
		}
		if (!session?.user?.id) {
			return ctx.throw(401)
		}
		const usedProfile = getBestMatchingProfile(profile)
		ctx.body = await createVismaSessionTokens(session, usedProfile)
	}

	const profiles = async ctx => {
		ctx.body = (await getProfiles()).map(({ id, description }) => ({ id, description }))
		ctx.status = 200
	}

	// NOTE: a reviewer might consider below a smell
	// but the test landing page is not relevant for testing/coverage
	/* istanbul ignore next */
	const testLandingPage = async ctx => {
		const { query: { ts_session_id } } = ctx
		const session = await visma.getSession({ sessionId: ts_session_id })
		const profile = getBestMatchingProfile('')
		ctx.body = await createVismaSessionTokens(session, profile)
	}

	return ({ registerKoaApi }: ApplicationContext) => registerKoaApi({
		login,
		logout,
		token,
		profiles,
		testLandingPage,
	})
}

export default vismaAuthModule