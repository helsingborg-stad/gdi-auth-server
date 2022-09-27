import * as jwt from 'jsonwebtoken'
import { VismaSession } from './visma-api'
import { SigningProfile } from './profiles'
import { RefreshTokenRepository } from './refresh-tokens'
import { getEnv } from '../framework/get-env'

export interface TokenServiceConfiguration {
	sharedSecretKey: string
	privateSecretKey: string,
	refreshTokens: RefreshTokenRepository
}

export interface SessionTokens {
	accessToken: string
	refreshToken: string
}

export interface TokenService {
    createVismaSessionTokens (session: VismaSession, profile: SigningProfile): Promise<SessionTokens>
}


export const getTokenServiceConfigurationFromEnv = (refreshTokens: RefreshTokenRepository): TokenServiceConfiguration => ({
	sharedSecretKey: getEnv('JWT_SHARED_SECRET'),
	privateSecretKey: getEnv('JWT_PRIVATE_SECRET'),
	refreshTokens,
})

export function createTokenService ({ privateSecretKey, sharedSecretKey, refreshTokens }: TokenServiceConfiguration): TokenService {
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
		refreshToken: await refreshTokens.registerRefreshTokenFor(session.user.id, createRefreshToken(session, profile)),
	})

	return {
		createVismaSessionTokens,
	}
}