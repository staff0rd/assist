import { requestSession } from "./requestSession";

export function requestAssistSession(
	assistArgs: string[],
	cwd?: string,
	options?: {
		inPlace?: boolean;
		inheritYolo?: boolean;
		launchedFrom?: string;
		node?: string;
		startPoint?: string;
	},
): Promise<string> {
	const node = options?.node;
	const parentId = process.env.ASSIST_SESSION_ID;
	return requestSession({
		type: "create-assist",
		assistArgs,
		cwd,
		inPlace: options?.inPlace === true,
		...(options?.startPoint && { startPoint: options.startPoint }),
		...(options?.inheritYolo && parentId && { yoloFrom: parentId }),
		// A bare launchedFrom pins the launch to this daemon, so a node-targeted launch drops it.
		...(node
			? { node }
			: {
					launchedFrom: options?.launchedFrom ?? parentId,
				}),
	});
}
