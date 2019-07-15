import { Request } from 'express';

export abstract class AbstractParser {
	public parseRequest(request: Request): any {
		return null;
	}

	public abstract parseResponse(data: any): any;
}