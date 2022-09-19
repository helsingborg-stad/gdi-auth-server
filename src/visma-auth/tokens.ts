import * as jwt from 'jsonwebtoken'
import { getEnv } from "../util/get-env"
import { VismaSession } from "./visma-api"
import { SigningProfile } from './profiles'

export interface TokenServiceConfiguration {
    secretKey: string
}

export interface TokenService {
    createVismaSessionToken (session: VismaSession, profile: SigningProfile),
    decodeToken(token: string): any,
    verifyToken(token: string): any
}


export const getTokenServiceConfigurationFromEnv = (): TokenServiceConfiguration => ({
    secretKey: getEnv({key: 'JWT_SECRET_KEY', trim: true})
})

export function createTokenService ({secretKey}: TokenServiceConfiguration): TokenService {
    const createVismaSessionToken = (session: VismaSession, profile: SigningProfile) => session?.user
        ? jwt.sign({
            ...session.user,
            sign_profile: profile.id
        }, secretKey, {
            ...profile.claims,
            subject: `ssn://${session.user.ssn}`   
        })
        : ''

    const decodeToken = (token: string): any => token && jwt.decode(token)

    const verifyToken = (token: string): any => {
        try {
            return token &&  jwt.verify(token, secretKey)
        } catch (err) {
            return null
        }
    } 
    return {
        createVismaSessionToken,
        decodeToken,
        verifyToken
    }
}