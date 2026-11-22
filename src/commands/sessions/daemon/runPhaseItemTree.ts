import { isRunPhaseSession } from "./isBacklogRunSession";

export function runPhaseItemTree(session: {
	commandType: string;
	assistArgs?: string[];
}): string | undefined {
	if (!isRunPhaseSession(session)) return undefined;
	const args = session.assistArgs ?? [];
	const flag = args.indexOf("--item-tree");
	return flag === -1 ? undefined : args[flag + 1];
}
