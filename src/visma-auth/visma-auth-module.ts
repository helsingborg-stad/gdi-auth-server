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
		const usedProfile = getBestMatchingProfile(profile)
		ctx.body = {
			jwt: createVismaSessionToken(session, usedProfile),
			maxAge: usedProfile.maxAge,
		}
	}

	const profiles = async ctx => {
		ctx.body = await getProfiles()
		ctx.status = 200
	}

	// NOTE: a reviewer might consider below a smell
	// but the test landing page is not relevant for testing/coverage
	/* istanbul ignore next */
	const testLandingPage = async ctx => {
		const { query: { ts_session_id } } = ctx
		const session = await visma.getSession({ sessionId: ts_session_id })
		const profile = getBestMatchingProfile('')
		ctx.body = {
			jwt: createVismaSessionToken(session, profile),
			maxAge: profile.maxAge,
			profile,
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