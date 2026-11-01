import { join } from "node:path";
import { getRestrictedDir } from "../codeComment/getRestrictedDir";

export function getSchemaUnlockPinPath(pin: string): string {
	return join(getRestrictedDir(), `schema-unlock-pin-${pin}.json`);
}
