import { Request, Response, Router } from 'express';
// import { PerformanceService } from '../../shared/logging/performance.service';
import { IMiddleware, IRouteOptions, MethodType } from 'wulgaru';

import { RouteMap } from '../config/model/route-map.model';
import { RequestError } from 'wulgaru/src/web/request-error';

// TODO: Fix naming
import { Err } from './parser.abstract';

export abstract class AbstractRouter<T> {
    protected readonly router: Router;
    private readonly routeMap: RouteMap;
    private middleware: Array<IMiddleware> = new Array<IMiddleware>();

    // protected readonly performanceService: PerformanceService = new PerformanceService();

    constructor(router: Router, routeMap: RouteMap) {
        this.router = router;
        this.routeMap = routeMap;
    }

    public abstract initRoutes(): void;

    public setMiddleware(middleware: Array<IMiddleware>): void {
        this.middleware = middleware;
    }

    protected get(options: IRouteOptions): void {
        this.router.get(options.url, this.decorateCallback(MethodType.GET, options));
    }

    protected post(options: IRouteOptions): void {
        this.router.post(options.url, this.decorateCallback(MethodType.POST, options));
    }

    protected put(options: IRouteOptions): void {
        this.router.put(options.url, this.decorateCallback(MethodType.PUT, options));
    }

    protected delete(options: IRouteOptions): void {
        this.router.delete(options.url, this.decorateCallback(MethodType.DELETE, options));
    }

    private decorateCallback(methodType: MethodType, options: IRouteOptions) {
        this.routeMap.addRouteRule(methodType, options.url);

        for (let i = 0; i < this.middleware.length; i++) {
            this.middleware[i].call(methodType, options);
        }

        return (request: Request, response: Response) => {
            const requestData = options.parser ? options.parser.parseRequest(request) : request;

            if (requestData instanceof  Err) {
                response.status(500).json(requestData);
            } else {
                const promise: Promise<any> = options.run.call(this, requestData);
                promise.then(this.replySuccess(response, options), this.replyFail(response, options));
                // options.run.call(this, this.replySuccess(response, options), this.replyFail(response, options), requestData);
            }
        };
    }

    private replySuccess(response: Response, options: IRouteOptions) {
        return (data: any) => {
            const responseData = options.parser ? options.parser.parseResponse(data) : data;
            response.status(200).json(responseData);
            // this.performanceService.stop();
        }
    }

    private replyFail(response: Response, options: IRouteOptions) {
        return (data: any) => {
            const responseData = data;
            response.status(500).json(responseData.message);
        }
    }
}
