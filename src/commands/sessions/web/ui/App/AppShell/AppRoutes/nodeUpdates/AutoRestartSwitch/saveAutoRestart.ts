import { saveConfigValue } from "../../../../ConfigView/ConfigRowValueCell/saveConfigValue";
import type { NodeUpdateEntry } from "../../../NodeUpdateEntry";

export function saveAutoRestart(
	entry: NodeUpdateEntry,
	installDir: string,
	value: boolean,
): Promise<{ error?: string }> {
	return saveConfigValue(
		{ key: "autoUpdate.restart", value, cwd: installDir, scope: "global" },
		entry.local ? undefined : entry.name,
	);
}
