import { ProfileService } from './profiles'
import { TokenService } from './tokens'
import { VismaAuthService } from './visma-api'

export interface AuthServices {
    profiles: ProfileService
    tokens: TokenService
    visma: VismaAuthService
}
