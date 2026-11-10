import { parseHarnessCapabilities } from "../../sessions/web/ui/parseHarnessCapabilities";
import type { AssistHarnessResult } from "./isAssistHarnessMessage";

export async function fetchAssistHarness(
	server: string,
): Promise<AssistHarnessResult> {
	try {
		const response = await fetch(`${server}/api/harness`);
		if (!response.ok)
			return {
				ok: false,
				message: `assist web server returned ${response.status}`,
			};
		return {
			ok: true,
			capabilities: parseHarnessCapabilities(await response.json()),
		};
	} catch {
		return { ok: false, message: `assist web server unreachable at ${server}` };
	}
}
