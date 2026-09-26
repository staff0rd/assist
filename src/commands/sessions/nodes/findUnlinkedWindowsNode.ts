import { detectPlatform } from "../../../lib/detectPlatform";
import type { DoctorProbes } from "./DoctorProbes";

const WINDOWS_NODE_URL = "http://127.0.0.1:3101";

export type LinkSuggestion = { nodeName: string; url: string; command: string };

export async function findUnlinkedWindowsNode(
	health: DoctorProbes["health"],
	platform: string = detectPlatform(),
): Promise<LinkSuggestion | undefined> {
	if (platform !== "wsl") return undefined;
	try {
		const { nodeName } = await health(WINDOWS_NODE_URL);
		if (!nodeName) return undefined;
		return {
			nodeName,
			url: WINDOWS_NODE_URL,
			command: `assist sessions nodes link ${nodeName} ${WINDOWS_NODE_URL}`,
		};
	} catch {
		return undefined;
	}
}
