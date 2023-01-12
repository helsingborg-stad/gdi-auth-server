import { ImpersonationService } from './impersonation/impersonations'
import { ProfileService } from './profiles'
import { TokenService } from './tokens'
import { VismaAuthService } from './visma-api'

export interface AuthServices {
    impersonations: ImpersonationService
    profiles: ProfileService
    tokens: TokenService
    visma: VismaAuthService
}
