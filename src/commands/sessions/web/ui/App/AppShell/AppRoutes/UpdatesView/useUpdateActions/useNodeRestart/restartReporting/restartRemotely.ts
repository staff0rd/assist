import type { RestartTarget as AdvisedTarget } from "../../../../../../../../../../watch/restartRules";
import type { NodeUpdateEntry } from "../../../../../NodeUpdateEntry";
import { postRestart, type RestartTarget } from "../../../../../postRestart";
import { requestFailure } from "../../../../../requestFailure";
import { awaitNodeRestarted } from "./restartRemotely/awaitNodeRestarted";

export async function restartRemotely(
	entry: NodeUpdateEntry,
	target: RestartTarget,
	advice: AdvisedTarget[],
): Promise<string> {
	let res: Response | undefined;
	try {
		res = await postRestart(target, entry.local ? undefined : entry.name);
	} catch {}
	if (!res?.ok) throw new Error(await requestFailure(res));
	const back = await awaitNodeRestarted(entry, advice);
	if (!back?.status) throw new Error(`${entry.name} did not come back`);
	return back.status.running;
}
