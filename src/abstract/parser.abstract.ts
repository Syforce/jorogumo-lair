import { Request } from 'express';

import { AbstractModelParser } from './model.parser';

export abstract class AbstractParser {
	public parseRequest(request: Request): any {
		return null;
	}

	public parseResponse(data: any): any {
		return data;
	}
}

export abstract class AbstractTypeParser<T> extends AbstractParser {
	private modelParser: AbstractModelParser<T>;

	constructor() {
		super();
		this.modelParser = this.getModelParser();
	}

	protected abstract getModelParser(): AbstractModelParser<T>;
}