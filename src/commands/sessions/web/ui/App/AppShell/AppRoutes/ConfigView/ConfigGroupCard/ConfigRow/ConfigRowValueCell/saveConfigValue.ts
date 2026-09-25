import type { ConfigWriteScope } from "../../../../../../../../../../config/ConfigWriteScope";
import { postConfigWrite } from "./postConfigWrite";

export type ConfigScope = ConfigWriteScope;

type SaveConfigValueRequest = {
	key: string;
	value: unknown;
	cwd: string;
	scope: ConfigScope;
};

export async function saveConfigValue(
	request: SaveConfigValueRequest,
): Promise<{ error?: string }> {
	return postConfigWrite("/api/config/set", request, "Failed to save config");
}
