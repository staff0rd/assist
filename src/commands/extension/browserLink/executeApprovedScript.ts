import type { UserScriptsApi } from "./browserApi";
import type { RunOutcome } from "./types";
import { wrapRunScript } from "./wrapRunScript";

type Wrapped = { value?: unknown; error?: unknown };

export async function executeApprovedScript(
	userScripts: Required<UserScriptsApi>,
	tabId: number,
	code: string,
): Promise<RunOutcome> {
	let injections: Awaited<ReturnType<Required<UserScriptsApi>["execute"]>>;
	try {
		injections = await userScripts.execute({
			js: [{ code: wrapRunScript(code) }],
			target: { tabId },
			injectImmediately: true,
		});
	} catch (error) {
		return {
			outcome: "error",
			error: error instanceof Error ? error.message : String(error),
		};
	}
	const [injection] = injections;
	if (injection?.error) return { outcome: "error", error: injection.error };
	const wrapped = (injection?.result ?? {}) as Wrapped;
	if (typeof wrapped.error === "string")
		return { outcome: "error", error: wrapped.error };
	if (typeof wrapped.value === "string")
		return { outcome: "ran", value: wrapped.value };
	return { outcome: "error", error: "the script returned no result" };
}
