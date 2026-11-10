import type { ChildProcessWithoutNullStreams } from "node:child_process";
import type { PendingCodexCall } from "./routeCodexRpcLine";

export type CodexAppServer = {
	call<T>(method: string, params: unknown): Promise<T>;
	close(): void;
};

export function createCodexRpcClient(
	child: ChildProcessWithoutNullStreams,
	pending: Map<number, PendingCodexCall>,
	timer: NodeJS.Timeout,
): CodexAppServer {
	let nextId = 0;
	return {
		call<T>(method: string, params: unknown) {
			return new Promise<T>((resolve, reject) => {
				const id = ++nextId;
				pending.set(id, {
					method,
					resolve: resolve as (value: unknown) => void,
					reject,
				});
				child.stdin.write(`${JSON.stringify({ id, method, params })}\n`);
			});
		},
		close() {
			clearTimeout(timer);
			child.removeAllListeners("exit");
			child.stdin.end();
			child.kill();
		},
	};
}
