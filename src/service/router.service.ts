import * as Express from 'express';
import { json, urlencoded } from 'body-parser';
import { createServer } from 'http';

import { IMiddleware } from 'wulgaru';
// import { DocService } from '../../../zitiron';

import { Server } from '../config/model/server.model';
import { AbstractRouter } from '../abstract/router.abstract';
import { RouteMap } from '../config/model/route-map.model';

export class RouterService {
    private static instance: RouterService = new RouterService();

    private app: Express.Application;
    private middleware: Array<IMiddleware> = new Array<IMiddleware>();
    private routeMap: RouteMap;

    private constructor() {
        this.routeMap = new RouteMap();
        console.log('Dev message: RouterService created');
    }

    public static getInstance(): RouterService {
        return this.instance;
    }

    public init(config: Server, shared?: boolean) {
        this.app = Express();

        this.app.use(json());
        this.app.use(urlencoded({ extended: true }));
        this.app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
            res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        // this.middleware.push(DocService.getInstance(this.app));

        if (shared) {
            const server = createServer(this.app);

            return server;
        } else {
            this.app.listen(config.port, (error) => {
                error ? console.log(error) : console.log(`Listening on port ${config.port}`);
            });

            return this.app;
        }

    }

    public registerRouter(router: any): void {
        const instance: AbstractRouter<any> = new router(this.app, this.routeMap);
        instance.setMiddleware(this.middleware);
        instance.initRoutes();
    }

    public getRouter(): Express.Application {
        return this.app;
    }
}