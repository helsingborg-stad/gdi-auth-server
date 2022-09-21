import { ApplicationContext, ApplicationModule } from '../framework/types'
import { AuthServices } from './types'

export function vismaAuthModule(services: AuthServices): ApplicationModule {
	const {
		visma, 
		tokens: { createVismaSessionToken }, 
		profiles: { getBestMatchingProfile, getProfiles },
	} = services

	const login = async ctx => {
		const { query: { redirect_url: callbackUrl, relay_state: relayState } } = ctx
		const loginResult = await visma.login({ callbackUrl, relayState })
		ctx.redirect(loginResult.redirectUrl)
	}

	const token = async ctx => {
		const { query: { ts_session_id, profile } } = ctx
		const session = await visma.getSession({ sessionId: ts_session_id })
		ctx.body = {
			jwt: createVismaSessionToken(session, getBestMatchingProfile(profile)),
		}
	}

	const profiles = async ctx => {
		ctx.body = await getProfiles()
		ctx.status = 200
	}

	const testLandingPage = async ctx => {
		const { query: { ts_session_id } } = ctx
		const session = await visma.getSession({ sessionId: ts_session_id })
		ctx.body = {
			jwt: createVismaSessionToken(session, getBestMatchingProfile('')),
			session,
		}
	}

	return ({ registerKoaApi }: ApplicationContext) => registerKoaApi({
		login,
		token,
		profiles,
		testLandingPage,
	})
}

export default vismaAuthModule