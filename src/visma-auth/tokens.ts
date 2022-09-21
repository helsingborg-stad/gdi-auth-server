import * as jwt from 'jsonwebtoken'
import { getEnv } from '../util/get-env'
import { VismaSession } from './visma-api'
import { SigningProfile } from './profiles'

export interface TokenServiceConfiguration {
    secretKey: string
}

export interface TokenService {
    createVismaSessionToken (session: VismaSession, profile: SigningProfile)
}


export const getTokenServiceConfigurationFromEnv = (): TokenServiceConfiguration => ({
	secretKey: getEnv('JWT_SECRET_KEY'),
})

export function createTokenService ({ secretKey }: TokenServiceConfiguration): TokenService {
	const createVismaSessionToken = (session: VismaSession, profile: SigningProfile) => session?.user
		? jwt.sign({
			...session.user,
			sign_profile: profile.id,
		}, secretKey, {
			...profile.claims,
			subject: `ssn://${session.user.ssn}`,   
		})
		: ''

	return {
		createVismaSessionToken,
	}
}