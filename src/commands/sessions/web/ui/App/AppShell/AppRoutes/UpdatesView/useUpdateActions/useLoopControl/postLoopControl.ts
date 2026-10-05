import type { AutoUpdateAction } from "../../../../../../../../shared/AutoUpdateAction";
import { withNode } from "../../../../../../withNode";
import type { NodeUpdateEntry } from "../../../../NodeUpdateEntry";
import { requestFailure } from "../../../../requestFailure";

export async function postLoopControl(
	entry: NodeUpdateEntry,
	action: AutoUpdateAction,
): Promise<string | undefined> {
	let res: Response | undefined;
	try {
		res = await fetch(
			withNode(
				`/api/updates/control?action=${action}`,
				entry.local ? undefined : entry.name,
			),
			{ method: "POST" },
		);
	} catch {}
	return res?.ok ? undefined : requestFailure(res);
}
