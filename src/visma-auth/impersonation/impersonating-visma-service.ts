import { ImpersonationService, tryGetImpersonatedIdFromSession } from './impersonations'
import { VismaAuthService } from '../visma-api'


export const createImpersonatingVismaService = (visma: VismaAuthService, impersonations: ImpersonationService): VismaAuthService => {
	if (!(impersonations?.canImpersonate())) {
		return visma
	}

	return {
		login: async ({ ctx, callbackUrl, relayState }) => {
			const { redirectUrl, sessionId } = await visma.login({ ctx, callbackUrl, relayState })
			const r = new URL('/impersonated-login', ctx.href)
			r.searchParams.append('redirectUrl', redirectUrl || '')
			r.searchParams.append('relayState', relayState || '')
			r.searchParams.append('sessionId', sessionId || '')
			r.searchParams.append('callbackUrl', callbackUrl || '')
			return {
				redirectUrl: r.toString(),
				sessionId,
			}
		},
		getSession: async ({ sessionId }) => {
			const impersonatedId = tryGetImpersonatedIdFromSession(sessionId)
			if (impersonatedId) {
				const impersonated = impersonations.getImpersonations().find(({ id }) => id == impersonatedId)
				if (!impersonated) {
					return {
						session: {},
						sessionId,
						error: {
							code: 'IMPERSONATION_NOT_FOUND',
							message: 'Impersonation could not be found',
						},
					}
				}
				return {
					session: {},
					sessionId,
					user: impersonated,
				}
			}
			return visma.getSession({ sessionId })
		},
		logout: ({ sessionId }) => tryGetImpersonatedIdFromSession(sessionId) ? void 0 : visma.logout({ sessionId }),
	}
}
