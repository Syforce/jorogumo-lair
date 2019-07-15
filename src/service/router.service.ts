import * as Express from 'express';

import { Server } from '../config/model/server.model';

export class RouterService {
	private app: Express.Application;

	constructor() {
		console.log('Dev message: RouterService created');
	}

	public init(config: Server) {
		this.app = Express();

		this.app.listen(config.port, (error) => {
			error ? console.log(error) : console.log(`Listening on port ${config.port}`);
		});
	}

	public getRouter(): Express.Application {
		return this.app;
	}
}

export const routerService: RouterService = new RouterService();