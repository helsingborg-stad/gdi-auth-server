import * as ms from 'ms'
import { getEnv } from "../util/get-env"

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
    maxAge: number
    claims: SigningProfileClaims
}

export interface ProfilesConfiguration {
    claims: SigningProfileClaims    
}

export const getProfilesConfigurationFromEnv = (): ProfilesConfiguration => ({
    claims: {
        issuer: getEnv({key: 'JWT_SIGN_ISSUER', trim: true, fallback: 'https://www.example.com'}),
        audience: getEnv({key: 'JWT_SIGN_AUDIENCE', trim: true, fallback: 'https://example.com'}),
        expiresIn: getEnv({key: 'JWT_SIGN_EXPIRES_IN', trim: true, fallback: '12h'}),
        notBefore: getEnv({key: 'JWT_SIGN_NOT_BEFORE', trim: true, fallback: '0s'}),
        subject: '<to be decided>'
        
    }
})

export function createProfileService ({claims}: ProfilesConfiguration): ProfileService {
    const makeClaims = (c: Partial<SigningProfileClaims>): SigningProfileClaims => ({
        ...claims,
        ...c
    })

    const makeProfile = (expiresIn: string, description: string) => ({
        id: expiresIn,
        description,
        maxAge: ms(expiresIn),
        claims: makeClaims({expiresIn})
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
        getBestMatchingProfile}
}