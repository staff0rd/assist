export function starredThenWaitingFirst<T>(
	items: T[],
	isStarred: (item: T) => boolean,
	isFloatingWaiter: (item: T) => boolean,
): T[] {
	const tier = (item: T) =>
		isStarred(item) ? 0 : isFloatingWaiter(item) ? 1 : 2;
	return [0, 1, 2].flatMap((rank) =>
		items.filter((item) => tier(item) === rank),
	);
}
