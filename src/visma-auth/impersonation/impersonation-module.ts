import { ApplicationContext, ApplicationModule } from '../../framework/types'
import { AuthServices } from '../types'
import * as pug from 'pug'
import { join } from 'path'
import { Impersonation, makeImpersonatedSessionId } from './impersonations'

export const impersonationModule = ({ impersonations }: AuthServices): ApplicationModule => ({ app, router }: ApplicationContext) => {
	if (!impersonations.canImpersonate()) {
		return
	}
	router.get('/impersonated-login', ctx => {
		const { query: { relay_state, visma_url, ts_session_id, callback_url } } = ctx

		const appendQuery = (url: string, query: Record<string, string>) => Object.entries(query).reduce((u, [ key, value ]) => {
			u.searchParams.append(key, value)
			return u	
		}, new URL(callback_url)).toString()
		
		const extendImpersonationWithLoginUrl = (impersonation: Impersonation): Impersonation & {login_url: string} => ({
			...impersonation,
			login_url: appendQuery(callback_url, {
				ts_session_id: makeImpersonatedSessionId(impersonation),
				relayState: relay_state,
			}),
		})
		ctx.type = 'text/html'
		ctx.body = pug.renderFile(join(process.cwd(), './resources/impersonated-login.pug'), {
			impersonations: impersonations.getImpersonations().map(extendImpersonationWithLoginUrl),
			visma_url,
			ts_session_id,
			relay_state,
		})
	})
}