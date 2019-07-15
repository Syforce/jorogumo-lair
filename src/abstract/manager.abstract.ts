// import { IDatastore } from '../../datastore/abstract/datastore.interface';

export abstract class AbstractManager<T> {
	// protected datastore: IDatastore<T>;

	constructor() {
		this.init();
	}

	protected abstract init();

	// public getAll(): Promise<Array<T>> {
	// 	return this.datastore.getAll();
	// }

	// public create(model: T): Promise<T> {
	// 	return this.datastore.create(model);
	// }
}