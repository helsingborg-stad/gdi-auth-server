import { ApplicationContext, ApplicationModule } from '../framework/types'
import { AuthServices } from './types'

export function vismaAuthModule(services: AuthServices): ApplicationModule {
	const {
		visma, 
		tokens: { createVismaSessionToken }, 
		profiles: { getBestMatchingProfile, getProfiles },
	} = services

	const login = async (c, ctx) => {
		const { query: { redirectUrl, relayState } } = ctx
		const loginResult = await visma.login({ callbackUrl: redirectUrl, relayState })
		ctx.redirect(loginResult.redirectUrl)
	}

	const token = async (c, ctx) => {
		const { query: { ts_session_id, profile } } = ctx
		const session = await visma.getSession({ sessionId: ts_session_id })
		ctx.body = {
			jwt: createVismaSessionToken(session, getBestMatchingProfile(profile)),
		}
	}

	const profiles = async (c, ctx) => {
		ctx.body = await getProfiles()
	}

	const testLandingPage = async (c, ctx) => {
		const { query: { ts_session_id } } = ctx
		const session = await visma.getSession({ sessionId: ts_session_id })
		ctx.body = {
			jwt: createVismaSessionToken(session, getBestMatchingProfile('')),
			session,
		}
	}

	return ({ api }: ApplicationContext) => api.register({
		login,
		token,
		profiles,
		testLandingPage,
	})
}

export default vismaAuthModule