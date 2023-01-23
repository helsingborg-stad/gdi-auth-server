import { getEnv } from '@helsingborg-stad/gdi-api-node'

export interface Impersonation {
	id: string
	name: string
	firstName: string
	lastName: string
}

export interface ImpersonationService {
	canImpersonate: () => boolean
	getImpersonations: () => Impersonation[]
}

const makeImpersonation = (id: string, firstName: string, lastName: string): Impersonation => ({
	id, firstName, lastName, name: `${firstName} ${lastName}`,
})

export const createImpersonationService = (impersonations: Impersonation[]): ImpersonationService => ({
	canImpersonate: () => impersonations?.length > 0,
	getImpersonations: () => impersonations,
})

export const parseImpersonationsFromEnv = (value: string): Impersonation[] => (value || '')
	.split(',')
	.map(v => v.trim())
	.map(v => v.split(/\s+/))
	.map(([ id, ...names ]) => makeImpersonation(
		id,
		names.slice(0 ,-1).join(' '),
		names[names.length-1]))
	.filter(({ id, firstName, lastName }) => id && firstName && lastName)

export const createImpersonationServiceFromEnv = (): ImpersonationService => createImpersonationService(
	parseImpersonationsFromEnv(getEnv('IMPERSONATION_PERSONS', { trim: true, fallback: '' }))
)

const impersonationPrefix = 'impersonated--'
export const tryGetImpersonatedIdFromSession = (sessionId: string): string => (sessionId || '').startsWith(impersonationPrefix) ? sessionId.substring(impersonationPrefix.length) : ''
export const makeImpersonatedSessionId = ({ id }: {id: string}): string => `${impersonationPrefix}${id}`
