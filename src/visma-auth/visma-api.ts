import * as request from 'superagent'
import * as Debug from 'debug'
import { getEnv } from '../framework/get-env'
import * as Koa from 'koa'
const debug = Debug('visma-api')

export interface VismaAuthConfiguration {
    baseUrl: string,
    customerKey: string,
    serviceKey: string
}

export interface VismaAuthApiLoginResult {
    redirectUrl: string,
    sessionId: string
}

export interface VismaSessionUser {
	id?: string
	name?: string
	firstName?: string,
	lastName?: string
}
export interface VismaSession {
    session: any
	sessionId: string
    user?: VismaSessionUser,
    error?: {
        code: string,
        message: string
    }
}

export interface VismaAuthService {
    login: ({ ctx, callbackUrl, relayState }: {ctx: Koa.Context, callbackUrl: string, relayState?: string}) => Promise<VismaAuthApiLoginResult>,
    getSession: ({ sessionId }: {sessionId: string}) => Promise<VismaSession>,
	logout: ({ sessionId }: {sessionId: string }) => Promise<void>
}

const makeUrl = (baseUrl: string, path: string) => new URL(path, baseUrl).toString()

const mapNativeSessionToVismaSession = (sessionId: string, session: any): VismaSession =>
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
			sessionId,
			error: {
				code: session?.errorObject?.code,
				message: session?.errorObject?.message,
			},
			session,
		})
		: session?.userAttributes?.serialNumber // described person in response?
			? ({
				user: {
					id: session?.userAttributes?.serialNumber,
					name: session?.userAttributes?.CN,
					firstName: session?.userAttributes?.GN, 
					lastName: session?.userAttributes?.SN, 
				},
				sessionId,
				session,
			})
			: ({
				error: {
					code: 'UNKNOWN',
					message: 'Internal validation failed',
				},
				sessionId,
				session,
			})


const tap = <T>(tapper: (v: T) => any): ((v: T) => T) => (v: T) => (tapper(v), v)

export const getVismaAuthConfigurationFromEnv = (): VismaAuthConfiguration => ({
	baseUrl: getEnv('VISMA_AUTH_BASEURL', { validate: v => !!new URL(v) }),
	customerKey: getEnv('VISMA_AUTH_CUSTOMERKEY'),
	serviceKey: getEnv('VISMA_AUTH_SERVICEKEY'),
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
		}))),
	logout: ({ sessionId }) => request
		.post(makeUrl(baseUrl, '/json1.1/Logout'))
		.query({
			customerKey: customerKey,
			serviceKey: serviceKey,
			sessionId,
		})
		.then(({ body: bodyForDebugging }) => bodyForDebugging)
		.then(tap(result => debug({
			'/json1.1/Logout': result,
		}))),
	getSession: ({ sessionId }) => request
		.get(makeUrl(baseUrl, '/json1.1/GetSession'))
		.query({
			customerKey: customerKey,
			serviceKey: serviceKey,
			sessionId,
		})
		.set('Accept', 'application/json')
		.then(({ body }) => body)
		.then(native => mapNativeSessionToVismaSession(sessionId, native))
		.then(tap(v => debug({
			'/json1.1/GetSession': v,
		}))),
})
