import * as pathToRegexp from 'path-to-regexp';

import { MethodType } from 'wulgaru';

interface URLRegexp {
	url: string;
	regex: RegExp;
}

export class RouteMap {
	private map: Record<MethodType, Array<URLRegexp>> = {
		[MethodType.GET]: new Array<URLRegexp>(),
		[MethodType.POST]: new Array<URLRegexp>(),
		[MethodType.PUT]: new Array<URLRegexp>(),
		[MethodType.DELETE]: new Array<URLRegexp>()
	};

	public addRouteRule(methodType: MethodType, url: string) {
		const list: Array<URLRegexp> = this.map[methodType];

		for (let i = 0; i < list.length; i++) {
			if (list[i].regex.test(url)) {
				console.log('\x1b[33m', `Warning: Route ${url} of type ${MethodType[methodType]} matched with ${list[i].url}`, '\x1b[0m');
				break;
			}
		}

		list.push({
			url: url,
			regex: pathToRegexp(url)
		});
	}
}
