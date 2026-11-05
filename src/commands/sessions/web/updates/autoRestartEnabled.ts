import { loadConfigFrom } from "../../../../shared/loadConfigFrom";

export function autoRestartEnabled(installDir: string): boolean {
	try {
		return loadConfigFrom(installDir).autoUpdate?.restart ?? false;
	} catch {
		return false;
	}
}
