import { withNode } from "../../../../withNode";
import { postConfigWrite } from "../postConfigWrite";
import type { ConfigScope } from "../saveConfigValue";

type UnsetConfigValueRequest = {
	key: string;
	cwd: string;
	scope: ConfigScope;
};

export async function unsetConfigValue(
	request: UnsetConfigValueRequest,
	node?: string,
): Promise<{ error?: string; removed?: boolean }> {
	const { error, payload } = await postConfigWrite(
		withNode("/api/config/unset", node),
		request,
		"Failed to clear config",
	);
	if (error) return { error };
	return {
		removed:
			typeof payload?.removed === "boolean" ? payload.removed : undefined,
	};
}
