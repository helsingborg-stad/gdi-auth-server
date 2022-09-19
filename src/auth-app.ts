import { createApplication } from "./framework"
import swaggerModule from "./framework/modules/swagger-module";
import webFrameworkModule from "./framework/modules/web-framework-module";
import { Application } from "./framework/types";
import { AuthServices } from "./visma-auth/types";
import vismaAuthModule from "./visma-auth/visma-auth-module";

export const createAuthApp = (services: AuthServices): Application =>
    createApplication({
        definition: './gdi-auth.openapi.yml'
    })
    .use(webFrameworkModule)
    .use(swaggerModule)
    .use(vismaAuthModule(services))
