import * as Debug from 'debug'
const debug = Debug('application')
import * as Koa from 'koa'
import * as Router from 'koa-router'
import OpenAPIBackend, { Context } from 'openapi-backend'

import { Application, ApplicationModule } from './types'

interface CreateApplicationArgs {
	openApiDefinitionPath: string,
	validateResponse?: boolean
}

const mapValues = <T, S>(obj: Record<string, T>, valueFn: ((v: T) => S)): Record<string, S> => Object
	.entries(obj)
	.reduce((agg, [ k, v ]) => ({
		...agg,
		[k]: valueFn(v),
	}), {} as Record<string, S>)
		

const performResponseValidation = (c: Context, ctx: Koa.Context) => {
	/**
	 * Perform response validation
	 * 
	 * Typically, this is done in tests only
	 * 
	 * To make life simpler, we only validate 2xx results
	 * Also, header validation is probably not needed
	 */
	const { status } = ctx
	if (!((status >= 200) && (status < 300))) {
		return
	}
	// https://github.com/anttiviljami/openapi-backend#response-validation
	([
		c.api.validateResponse(ctx.body, c.operation),
		/*
		c.api.validateResponseHeaders(ctx.headers, c.operation, {
			statusCode: ctx.status,
			setMatchType: SetMatchType.Superset,
		}),
		*/
	])
		.map(({ errors }) => errors)
		.filter(errors => errors && errors.length)
		.map(errors => {
			debug({
				operation: c.operation,
				errors,
			})
			ctx.throw(502)
		})
}
	

export function createApplication({ openApiDefinitionPath, validateResponse }: CreateApplicationArgs): Application {
	// create app
	const app = new Koa()
	// create API backend
	const api = new OpenAPIBackend({ definition: openApiDefinitionPath })
	// create routes
	const router = new Router()

	// setup reasonable defaults
	api.register({
		// https://github.com/anttiviljami/openapi-backend#quick-start
		notFound: (c, ctx) => ctx.throw(404),
		validationFail: (c, ctx) => {
			ctx.body = { errors: c.validation.errors }
			ctx.status = 400
		},
	})
	
	// register response validation if wanted
	api.register({
		postResponseHandler: async (c, ctx) => {
			ctx.set('Cache-Control', 'no-store')
			return validateResponse && performResponseValidation(c, ctx)
		},
	})

	return {
		getContext() {
			return {
				app,
				router,
				api,
				application: this,
				registerKoaApi: handlers => api.register(mapValues(handlers, handler => (c, ctx, next) => handler(ctx, next))),
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
				.use((ctx, next) => api.handleRequest(ctx.request, ctx, next))
				.listen(port, () => debug(`Server listening to port ${port}`))
		},
	}
} 