import { noSavedSlicesPrefix } from "../../../shared/noSavedSlicesMessage";
import type { DeferredResult } from "./runDeferredCommand";

export function noSavedSlices(result: DeferredResult): string | undefined {
	if (result.exitCode === 0) return undefined;
	return result.output
		.split(/\r?\n/)
		.find((line) => line.startsWith(noSavedSlicesPrefix));
}
