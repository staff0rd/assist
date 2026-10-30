import type { RunOutcome } from "../extension/browserLink/types";

export function formatRunOutcome(run: RunOutcome): {
	ok: boolean;
	message: string;
} {
	if (run.outcome === "ran") return { ok: true, message: run.value };
	if (run.outcome === "error")
		return { ok: false, message: `script threw: ${run.error}` };
	if (run.outcome === "declined")
		return { ok: false, message: "declined: the user dismissed the script" };
	return {
		ok: false,
		message: "declined: nobody clicked Run before the approval timed out",
	};
}
