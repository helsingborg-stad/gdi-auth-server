import * as cors from '@koa/cors' 
import * as bodyparser from 'koa-bodyparser'

const webFramworkModule = ({app}) => app
    .use(cors())
    .use(bodyparser())

export default webFramworkModule