import { join } from "node:path";
import { getRestrictedDir } from "../codeComment/getRestrictedDir";

export function getDocsUnlockPinPath(pin: string): string {
	return join(getRestrictedDir(), `docs-unlock-pin-${pin}.json`);
}
