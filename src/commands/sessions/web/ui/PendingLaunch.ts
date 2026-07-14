import { isWindowsCwd } from "./isWindowsCwd";

export type PendingLaunch = {
	id: string;
	cwd?: string;
	title: string;
	windows: boolean;
	status: "launching" | "error";
	error?: string;
	startedAt: number;
};

type NewPendingLaunch = {
	id: string;
	cwd?: string;
	title: string;
	startedAt: number;
};

export function addLaunch(
	list: PendingLaunch[],
	launch: NewPendingLaunch,
): PendingLaunch[] {
	return [
		...list,
		{ ...launch, windows: isWindowsCwd(launch.cwd), status: "launching" },
	];
}

export function resolveOldestLaunching(list: PendingLaunch[]): PendingLaunch[] {
	const target = list.find((l) => l.status === "launching");
	return target ? list.filter((l) => l.id !== target.id) : list;
}

export function failOldestLaunching(
	list: PendingLaunch[],
	message: string,
): PendingLaunch[] {
	const target = list.find((l) => l.status === "launching");
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

export function pendingLaunchFromMessage(
	msg: object,
): { cwd?: string; title: string } | null {
	const m = msg as {
		type?: string;
		cwd?: string;
		prompt?: string;
		title?: string;
		design?: boolean;
	};
	if (m.type === "create")
		return {
			cwd: m.cwd,
			title:
				m.prompt?.trim() || (m.design ? "New design session" : "New session"),
		};
	if (m.type === "create-assist")
		return { cwd: m.cwd, title: m.title?.trim() || "New session" };
	return null;
}
