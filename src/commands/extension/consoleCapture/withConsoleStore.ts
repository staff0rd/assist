const DB_NAME = "assist-console";
const STORE_NAME = "entries";

function openConsoleDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, 1);
		request.onupgradeneeded = () =>
			request.result
				.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true })
				.createIndex("time", "time");
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

export async function withConsoleStore<T>(
	mode: IDBTransactionMode,
	run: (store: IDBObjectStore) => T,
): Promise<T> {
	const db = await openConsoleDb();
	try {
		return await new Promise<T>((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, mode);
			const result = run(transaction.objectStore(STORE_NAME));
			transaction.oncomplete = () => resolve(result);
			transaction.onerror = () => reject(transaction.error);
			transaction.onabort = () => reject(transaction.error);
		});
	} finally {
		db.close();
	}
}
