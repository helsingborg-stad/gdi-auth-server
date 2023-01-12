import { createImpersonatingVismaService } from './impersonation/impersonating-visma-service'
import { createImpersonationServiceFromEnv } from './impersonation/impersonations'
import { createProfileService, getProfilesConfigurationFromEnv } from './profiles'
import { createNullRefreshTokenRepository } from './refresh-tokens'
import { createTokenService, getTokenServiceConfigurationFromEnv } from './tokens'
import { AuthServices } from './types'
import { createVismaAuthService, getVismaAuthConfigurationFromEnv } from './visma-api'

export const createServicesFromEnv = (): AuthServices => fixupServices({
	impersonations: createImpersonationServiceFromEnv(),
	profiles: createProfileService(getProfilesConfigurationFromEnv()),
	visma: createVismaAuthService(getVismaAuthConfigurationFromEnv()),
	tokens: createTokenService(getTokenServiceConfigurationFromEnv(createNullRefreshTokenRepository())),
})

export const fixupServices = ({ impersonations, profiles, visma, tokens }: AuthServices): AuthServices => ({
	impersonations,
	profiles,
	visma: impersonations?.canImpersonate() ? createImpersonatingVismaService(visma, impersonations) : visma,
	tokens,
})