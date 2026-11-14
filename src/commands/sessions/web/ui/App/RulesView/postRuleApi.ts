import { withNode } from "../../withNode";
import { postJson } from "../postJson";

export async function postRuleApi(
	path: string,
	node: string | undefined,
	body: unknown,
	failureMessage: string,
): Promise<
	{ ok: true; body: Record<string, unknown> } | { ok: false; error: string }
> {
	try {
		return {
			ok: true,
			body: await postJson(withNode(path, node), body, failureMessage),
		};
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}
