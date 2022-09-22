import * as jwt from 'jsonwebtoken'
import { getEnv } from '../util/get-env'
import { VismaSession } from './visma-api'
import { SigningProfile } from './profiles'

export interface TokenServiceConfiguration {
	sharedSecretKey: string
	privateSecretKey: string
}

export interface SessionTokens {
	accessToken: string
	refreshToken: string
}

export interface TokenService {
    createVismaSessionTokens (session: VismaSession, profile: SigningProfile): Promise<SessionTokens>
}


export const getTokenServiceConfigurationFromEnv = (): TokenServiceConfiguration => ({
	sharedSecretKey: getEnv('JWT_SHARED_SECRET_KEY'),
	privateSecretKey: getEnv('JWT_PRIVATE_SECRET_KEY'),
})

export function createTokenService ({ privateSecretKey, sharedSecretKey }: TokenServiceConfiguration): TokenService {
	const createAccessToken = (session: VismaSession, profile: SigningProfile) => session?.user
		? jwt.sign({
			...session.user,
			sign_profile: profile.id,
		}, sharedSecretKey, {
			...profile.accessToken.claims,
			subject: `id://${session.user.id}`,   
		})
		: ''

	const createRefreshToken = (session: VismaSession, profile: SigningProfile) => session?.user
		? jwt.sign({
			...session.user,
			sign_profile: profile.id,
		}, privateSecretKey, {
			...profile.refreshToken.claims,
			subject: `id://${session.user.id}`,   
		})
		: '' 

	const createVismaSessionTokens = async (session: VismaSession, profile: SigningProfile): Promise<SessionTokens> => ({
		accessToken: createAccessToken(session, profile),
		refreshToken: createRefreshToken(session, profile),
	})

	return {
		createVismaSessionTokens,
	}
}