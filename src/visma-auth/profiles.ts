import ms from 'ms'
import { getEnv } from '@helsingborg-stad/gdi-api-node'

export interface ProfileService {
    getProfiles(): SigningProfile[],
    getBestMatchingProfile(id: string): SigningProfile    
}

export interface SigningProfileClaims {
    issuer: string
    audience: string
    expiresIn: string
    notBefore: string
    subject: string
}

export interface SigningProfile {
    id: string
    description: string
	accessToken: {
		maxAge: number
		claims: SigningProfileClaims
	}
	refreshToken: {
		maxAge: number
		claims: SigningProfileClaims
	}
}

export interface ProfilesConfiguration {
    claims: SigningProfileClaims    
}

export const getProfilesConfigurationFromEnv = (): ProfilesConfiguration => ({
	claims: {
		issuer: getEnv('JWT_SIGN_ISSUER', { trim: true, fallback: 'https://www.example.com' }),
		audience: getEnv('JWT_SIGN_AUDIENCE', { trim: true, fallback: 'https://example.com' }),
		expiresIn: getEnv('JWT_SIGN_EXPIRES_IN', { trim: true, fallback: '12h' }),
		notBefore: getEnv('JWT_SIGN_NOT_BEFORE', { trim: true, fallback: '0s' }),
		subject: '<to be decided>',
	},
})

export function createProfileService ({ claims }: ProfilesConfiguration): ProfileService {
	const makeClaims = (c: Partial<SigningProfileClaims>): SigningProfileClaims => ({
		...claims,
		...c,
	})

	const makeProfile = (expiresIn: string, description: string): SigningProfile => ({
		id: expiresIn,
		description,
		accessToken: {
			maxAge: ms(expiresIn),
			claims: makeClaims({ expiresIn }),
		},
		refreshToken: {
			maxAge: ms('7 days'),
			claims: makeClaims({ expiresIn: '7 days' }),
		},
	})

	const profiles: SigningProfile[] = [
		makeProfile('20m', '20 minute session'),
		makeProfile('1h', '1 hour session'),
		makeProfile('12h', '12 hour session'),
		makeProfile('7d', '7 day session'),
		makeProfile('1s', '1 second session'),
	]

	const getProfiles = (): SigningProfile[] => profiles
	const getBestMatchingProfile = (id: string): SigningProfile => profiles.filter(p => p.id === id)[0] || profiles[0]

	return {
		getProfiles, 
		getBestMatchingProfile }
}