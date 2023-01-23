import jwt from 'jsonwebtoken'
import { VismaSession, VismaSessionUser } from './visma-api'
import { SigningProfile } from './profiles'
import { RefreshTokenRepository } from './refresh-tokens'
import { getEnv } from '@helsingborg-stad/gdi-api-node'

export interface TokenPayload extends VismaSessionUser {
	sign_profile: string,
	sessionId: string
}
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
	verifyToken(token: string): Promise<TokenPayload | null>
}

const makeTokenPayload = (session: VismaSession, profile: string, sessionId: string): TokenPayload => ({
	...session.user,
	sign_profile: profile,
	sessionId,
})

export const getTokenServiceConfigurationFromEnv = (refreshTokens: RefreshTokenRepository): TokenServiceConfiguration => ({
	sharedSecretKey: getEnv('JWT_SHARED_SECRET'),
	privateSecretKey: getEnv('JWT_PRIVATE_SECRET'),
	refreshTokens,
})

export function createTokenService ({ privateSecretKey, sharedSecretKey, refreshTokens }: TokenServiceConfiguration): TokenService {
	const createToken = (key: string, session: VismaSession, profile: SigningProfile) => session?.user
		? jwt.sign(
			makeTokenPayload(session, profile.id, session.sessionId),
			key, 
			{
				...profile.accessToken.claims,
				subject: `id://${session.user.id}`,   
			})
		: ''

	const createAccessToken = (session: VismaSession, profile: SigningProfile) => createToken(sharedSecretKey, session, profile)

	const createRefreshToken = (session: VismaSession, profile: SigningProfile) => createToken(privateSecretKey, session, profile)

	const createVismaSessionTokens = async (session: VismaSession, profile: SigningProfile): Promise<SessionTokens> => ({
		accessToken: session && profile ? createAccessToken(session, profile) : '',
		refreshToken: session?.user?.id && profile ? await refreshTokens.registerRefreshTokenFor(session.user.id, createRefreshToken(session, profile)) : '',
	})

	const verifyToken = async (token: string) => {
		const verified = token && await jwt.verify(token, sharedSecretKey)
		return verified
			? verified as TokenPayload
			: null
	}

	return {
		createVismaSessionTokens,
		verifyToken,
	}
}