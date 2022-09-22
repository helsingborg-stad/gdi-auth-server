import { createProfileService, getProfilesConfigurationFromEnv } from './profiles'
import { createNullRefreshTokenRepository } from './refresh-tokens'
import { createTokenService, getTokenServiceConfigurationFromEnv } from './tokens'
import { AuthServices } from './types'
import { createVismaAuthService, getVismaAuthConfigurationFromEnv } from './visma-api'

export const createServicesFromEnv = (): AuthServices => ({
	profiles: createProfileService(getProfilesConfigurationFromEnv()),
	visma: createVismaAuthService(getVismaAuthConfigurationFromEnv()),
	tokens: createTokenService(getTokenServiceConfigurationFromEnv(createNullRefreshTokenRepository())),
})
