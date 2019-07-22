import { Request, Response, Router } from 'express';

import { AbstractManager } from './manager.abstract';
// import { PerformanceService } from '../../shared/logging/performance.service';
import { AbstractParser } from './parser.abstract';
import { IRouteOptions } from '../config/model/route-options.model';

export abstract class AbstractRouter<T> {
	protected readonly router: Router;
	// protected readonly performanceService: PerformanceService = new PerformanceService();

	protected manager: AbstractManager<T>;

	constructor(router: Router) {
		this.router = router;

		this.initManagers();
		this.initRoutes();
	}

	protected abstract initManagers();

	protected abstract initRoutes();

	protected get(options: IRouteOptions) {
		this.router.get(options.url, this.decorateCallback(options));
	}

	protected post(options: IRouteOptions) {
		this.router.post(options.url, this.decorateCallback(options));
	}

	protected put(options: IRouteOptions) {
		this.router.put(options.url, this.decorateCallback(options));
	}

	protected delete(options: IRouteOptions) {
		this.router.delete(options.url, this.decorateCallback(options));
	}

	private decorateCallback(options: IRouteOptions) {
		return (request: Request, response: Response) => {
			// this.performanceService.start();
			const args: Array<any> = new Array<any>();
			const requestData = options.parser.parseRequest(request);

			requestData && args.push(requestData);
			args.push(this.reply(response, options));

			options.callback.apply(this, args);
		};
	}

	private reply(response: Response, options: IRouteOptions) {
		return (data) => {
			const responseData = options.parser ? options.parser.parseResponse(data) : data;
			response.status(200).json(responseData);
			// this.performanceService.stop();
		}
	}
}