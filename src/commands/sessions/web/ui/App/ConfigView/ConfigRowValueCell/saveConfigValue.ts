import type { ConfigWriteScope } from "../../../../../../config/ConfigWriteScope";
import { withNode } from "../../../withNode";
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
	node?: string,
): Promise<{ error?: string }> {
	return postConfigWrite(
		withNode("/api/config/set", node),
		request,
		"Failed to save config",
	);
}
