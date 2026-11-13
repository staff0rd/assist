type Action = (...args: never[]) => unknown;

export function lazyAction<K extends string, M extends Record<K, Action>>(
	load: () => Promise<M>,
	name: K,
): (...args: Parameters<M[K]>) => Promise<void> {
	return async (...args) => {
		const action = (await load())[name] as (
			...args: Parameters<M[K]>
		) => unknown;
		await action(...args);
	};
}
