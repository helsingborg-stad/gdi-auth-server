import { ApplicationContext, ApplicationModule } from '../../framework/types'
import { AuthServices } from '../types'
import * as pug from 'pug'
import { join } from 'path'
import { Impersonation, makeImpersonatedSessionId } from './impersonations'

export const impersonationModule = ({ impersonations }: AuthServices): ApplicationModule => ({ router }: ApplicationContext) => {
	if (!impersonations.canImpersonate()) {
		return
	}

	router.get('/impersonated-login', ctx => {
		const { query: { relayState, redirectUrl, sessionId, callbackUrl } } = ctx

		const appendQuery = (url: string, query: Record<string, string>) => Object.entries(query).reduce((u, [ key, value ]) => {
			u.searchParams.append(key, value)
			return u	
		}, new URL(callbackUrl)).toString()
		
		const extendImpersonationWithLoginUrl = (impersonation: Impersonation): Impersonation & {loginUrl: string} => ({
			...impersonation,
			loginUrl: appendQuery(callbackUrl, {
				ts_session_id: makeImpersonatedSessionId(impersonation),
				relayState,
			}),
		})
		ctx.type = 'text/html'
		ctx.body = pug.renderFile(join(process.cwd(), './resources/impersonated-login.pug'), {
			impersonations: impersonations.getImpersonations().map(extendImpersonationWithLoginUrl),
			redirectUrl,
			sessionId,
			relayState,
		})
	})
}