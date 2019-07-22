export abstract class AbstractModelParser<T> {

	public abstract parseOne(data: any): T;

	public abstract parseMany(data: Array<any>): Array<T>;
}