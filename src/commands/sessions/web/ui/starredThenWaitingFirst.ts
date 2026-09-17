const never = () => false;

export function starredThenWaitingFirst<T>(
	items: T[],
	isStarred: (item: T) => boolean,
	isFloatingWaiter: (item: T) => boolean,
	isWatcher: (item: T) => boolean = never,
): T[] {
	const tier = (item: T) =>
		isStarred(item) ? 0 : isWatcher(item) ? 1 : isFloatingWaiter(item) ? 2 : 3;
	return [0, 1, 2, 3].flatMap((rank) =>
		items.filter((item) => tier(item) === rank),
	);
}
