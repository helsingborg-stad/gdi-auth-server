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

export const createImpersonationServiceFromEnv = (): ImpersonationService => createImpersonationService([
	makeImpersonation('193504049135', 'Filip', 'Walldén'),
	makeImpersonation('197503259280', 'Nina', 'Greger'),
])

const impersonationPrefix = 'impersonated--'
export const tryGetImpersonatedIdFromSession = (sessionId: string): string => (sessionId || '').startsWith(impersonationPrefix) ? sessionId.substring(impersonationPrefix.length) : ''
export const makeImpersonatedSessionId = ({ id }: Impersonation): string => `${impersonationPrefix}${id}`