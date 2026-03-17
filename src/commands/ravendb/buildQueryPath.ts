export function buildQueryPath(opts: {
	db: string;
	collection?: string;
	start: number;
	pageSize: number;
	sort: string;
	query?: string;
}): string {
	const db = encodeURIComponent(opts.db);
	let path: string;

	if (opts.collection) {
		path = `/databases/${db}/indexes/dynamic/${encodeURIComponent(opts.collection)}?start=${opts.start}&pageSize=${opts.pageSize}&sort=${encodeURIComponent(opts.sort)}`;
	} else {
		path = `/databases/${db}/queries?start=${opts.start}&pageSize=${opts.pageSize}`;
	}

	if (opts.query) {
		path += `&query=${encodeURIComponent(opts.query)}`;
	}

	return path;
}
