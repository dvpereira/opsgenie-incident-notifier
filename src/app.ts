import express from 'express'
import { json } from 'body-parser';
import {eventContext} from 'aws-serverless-express/middleware'
import routes from './routes';

/*class App {
    public express: express.Application

    public constructor () {
        this.express = express()
        this.middlewares()
        this.routes()
    }

    private middlewares (): void {
        this.express.use(express.json())
        this.express.use(eventContext())
    }

    private routes (): void {
        this.express.use(routes)
    }
}*/


export function configureApp() {
    const app = express()
    app.use(json())
    app.use(eventContext())
    app.use(routes)

    return app
}
//export default new App