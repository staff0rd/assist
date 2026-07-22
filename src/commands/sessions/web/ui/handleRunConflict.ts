import type { WsDispatch } from "./WsDispatch";

export function handleRunConflict(
	msg: Record<string, unknown>,
	d: WsDispatch,
): void {
	d.setServerConflict({
		existing: msg.existing as {
			id: string;
			name: string;
			cwd?: string;
			port?: number;
		},
		runName: msg.runName as string | undefined,
		cwd: msg.cwd as string | undefined,
		sessionId: msg.sessionId as string | undefined,
	});
}
