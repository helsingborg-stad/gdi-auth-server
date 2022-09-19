const debug = require('debug')('application')
import * as Koa from 'koa'
import * as Router from 'koa-router'
import OpenAPIBackend, { Options } from 'openapi-backend'

import { Application, ApplicationModule } from './types'

export function createApplication(opts: Options): Application {
	// create app
	const app = new Koa()
	// create API backend
	const api = new OpenAPIBackend(opts)
	// create routes
	const router = new Router()

	// setup reasonable defaults
	api.register({
		notFound: (c, ctx) => ctx.throw(404),
		validationFail: (c, ctx) => {
			ctx.body = { errors: c.validation.errors }
			ctx.status = 400
		},
	})
      
	return {
		getContext() {
			return {
				app,
				router,
				api,
				application: this,
			}
		}, 
		use(module: ApplicationModule) {
			module(this.getContext())
			return this
		},
		async start(port) {
			// finalize api
			await api.init()
			return app
			// wire all custom routes
				.use(router.routes())
				.use(router.allowedMethods())
			// wire in API endpoints
				.use((ctx) => api.handleRequest(ctx.request, ctx))
				.listen(port, () => debug(`Server listening to port ${port}`))
		},
	}
} 