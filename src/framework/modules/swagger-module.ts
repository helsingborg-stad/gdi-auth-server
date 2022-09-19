import { koaSwagger } from 'koa2-swagger-ui'
import { ApplicationContext } from '../types'

const swaggerModule = ({ app, router, api }: ApplicationContext) => {
	app.use(koaSwagger({
		routePrefix: '/swagger',
		swaggerOptions: {
			url: '/swagger.json',
		},
	}))

	router
		.get('/swagger.json', cxt => {
			cxt.body = api.document
		})
		.get('/', ctx => ctx.redirect('/swagger'))
}

export default swaggerModule