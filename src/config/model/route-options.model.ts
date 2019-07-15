import { AbstractParser } from '../../abstract/parser.abstract';

export interface IRouteOptions {
	url: string;
	callback: Function;
	parser: AbstractParser;
}