import {
	type ConfigKeyScope,
	writeConfigKeys,
} from "../config/writeConfigKeys";
import { declaredStreamsInScope } from "./declaredStreamsInScope";
import { mergeRepoStreams } from "./mergeRepoStreams";

type WriteResult =
	| { ok: true; target: string }
	| { ok: false; errors: string[] };

export async function writeReleaseStreams(
	incoming: Record<string, unknown>[],
	scope: ConfigKeyScope,
): Promise<WriteResult> {
	return writeConfigKeys(
		[
			{
				key: "releases.streams",
				value: mergeRepoStreams(await declaredStreamsInScope(scope), incoming),
			},
		],
		scope,
	);
}
