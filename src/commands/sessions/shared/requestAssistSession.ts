import { requestSession } from "./requestSession";

export function requestAssistSession(
	assistArgs: string[],
	cwd?: string,
	options?: { inPlace?: boolean; launchedFrom?: string; node?: string },
): Promise<string> {
	const node = options?.node;
	return requestSession({
		type: "create-assist",
		assistArgs,
		cwd,
		inPlace: options?.inPlace === true,
		// A bare launchedFrom pins the launch to this daemon, so a node-targeted launch drops it.
		...(node
			? { node }
			: {
					launchedFrom: options?.launchedFrom ?? process.env.ASSIST_SESSION_ID,
				}),
	});
}
