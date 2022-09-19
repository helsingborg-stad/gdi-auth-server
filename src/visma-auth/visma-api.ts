import * as request from 'superagent'
import { getEnv } from '../util/get-env'
const debug = require('debug')('visma-api')

export interface VismaAuthConfiguration {
    baseUrl: string,
    customerKey: string,
    serviceKey: string
}

export interface VismaAuthApiLoginResult {
    redirectUrl: string,
    sessionId: string
}

export interface VismaSession {
    session: any,
    user?: {
        ssn?: string,
        name?: string
    },
    error?: {
        code: string,
        message: string
    }
}

export interface VismaAuthService {
    login: ({ callbackUrl, relayState }: {callbackUrl: string, relayState?: string}) => Promise<VismaAuthApiLoginResult>,
    getSession: ({ sessionId }: {sessionId: string}) => Promise<VismaSession>
}

const makeUrl = (baseUrl: string, path: string) => new URL(path, baseUrl).toString()

const mapNativeSessionToVismaSession = (session: any): VismaSession =>
/*
        Session could look something like
        {
            "sessionId": "...",
            "username": "197001010000",
            "userAttributes": {
                "system": "helsingborg_rest_test",
                "C": "SE",
                "O": "Testbank A AB (publ)",
                "SN": "Smith",
                "GN": "John",
                "serialNumber": "197001010000",
                "name": "(211217 10.12) John Smith - BankID på fil",
                "CN": "John Smith",
                "issuerCommonName": "BankID File",
                "idp": "WPKI",
                "type": "auth",
                "urn:oid:1.2.752.201.3.2": "8e7a8fd6-96fa-4b77-a796-e48e9b90e6e1",
                "urn:oid:1.2.752.201.3.3": "bankidNotBefore=2021-12-16T23%3A00%3A00Z;bankidNotAfter=2022-12-17T22%3A59%3A59Z;bankidUserAgentAddress=193.180.104.62"
            }
        }

        but also like
        {
            "errorObject": {
                "code": "NOTLOGGEDIN",
                "message": "This session 55F89526DD20C3D7A001580B23390232DAFB26A7D7 is not a logged in user"
            }
        }        
    */
	session?.errorObject?.code // described error in response?
		? ({
			session,
			error: {
				code: session?.errorObject?.code,
				message: session?.errorObject?.message,
			} })
		: session?.userAttributes?.serialNumber // described person in response?
			? ({
				session,
				user: {
					ssn: session?.userAttributes?.serialNumber,
					name: session?.userAttributes?.CN,
				},
			})
			: ({
				session,
				error: {
					code: 'UNKNOWN',
					message: 'Internal validation failed',
				},
			})


const tap = <T>(tapper: (v: T) => any): ((v: T) => T) => (v: T) => (tapper(v), v)

export const getVismaAuthConfigurationFromEnv = (): VismaAuthConfiguration => ({
	baseUrl: getEnv({ key: 'VISMA_AUTH_BASEURL', trim: true, validate: v => !!new URL(v) }),
	customerKey: getEnv({ key: 'VISMA_AUTH_CUSTOMERKEY', trim: true }),
	serviceKey: getEnv({ key: 'VISMA_AUTH_SERVICEKEY', trim: true }),
})

export const createVismaAuthService = ({ baseUrl, customerKey, serviceKey }: VismaAuthConfiguration): VismaAuthService => ({
	login: ({ callbackUrl, relayState }) => request
		.get(makeUrl(baseUrl, '/json1.1/Login'))
		.query({
			customerKey: customerKey,
			serviceKey: serviceKey,
			relayState,
			callbackUrl,
		})
		.set('Accept', 'application/json')
		.then(({ body }) => body as VismaAuthApiLoginResult)
		.then(tap(result => debug({
			'/json1.1/Login': result,
		})))
	,

	getSession: ({ sessionId }) => request
		.get(makeUrl(baseUrl, '/json1.1/GetSession'))
		.query({
			customerKey: customerKey,
			serviceKey: serviceKey,
			sessionId,
		})
		.set('Accept', 'application/json')
		.then(({ body }) => body)
		.then(mapNativeSessionToVismaSession)
		.then(tap(v => debug({
			'/json1.1/GetSession': v,
		}))),
})
