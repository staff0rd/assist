import { existsSync } from "node:fs";
import { join } from "node:path";

export function holdsNoCheckout(path: string): boolean {
	return existsSync(path) && !existsSync(join(path, ".git"));
}
