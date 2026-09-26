export type PendingLaunch = {
	id: string;
	cwd?: string;
	title: string;
	named?: boolean;
	node?: string;
	status: "launching" | "error";
	error?: string;
	startedAt: number;
};

export type NewLaunchInput = {
	cwd?: string;
	title: string;
	named?: boolean;
	node?: string;
};

type NewPendingLaunch = NewLaunchInput & {
	id: string;
	startedAt: number;
};

export function addLaunch(
	list: PendingLaunch[],
	launch: NewPendingLaunch,
): PendingLaunch[] {
	return [...list, { ...launch, status: "launching" }];
}

export function oldestLaunching(
	list: PendingLaunch[],
): PendingLaunch | undefined {
	return list.find((l) => l.status === "launching");
}

export function resolveOldestLaunching(list: PendingLaunch[]): PendingLaunch[] {
	const target = oldestLaunching(list);
	return target ? list.filter((l) => l.id !== target.id) : list;
}

export function failOldestLaunching(
	list: PendingLaunch[],
	message: string,
): PendingLaunch[] {
	const target = oldestLaunching(list);
	return target ? failLaunch(list, target.id, message) : list;
}

export function failLaunch(
	list: PendingLaunch[],
	id: string,
	message: string,
): PendingLaunch[] {
	return list.map((l) =>
		l.id === id && l.status === "launching"
			? { ...l, status: "error", error: message }
			: l,
	);
}

export function dismissLaunch(
	list: PendingLaunch[],
	id: string,
): PendingLaunch[] {
	return list.filter((l) => l.id !== id);
}
