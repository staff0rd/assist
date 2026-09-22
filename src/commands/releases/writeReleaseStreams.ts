import {
	type ConfigKeyScope,
	writeConfigKeys,
} from "../config/writeConfigKeys";
import { declaredStreamsInScope } from "./declaredStreamsInScope";
import { mergeRepoStreams } from "./mergeRepoStreams";

type WriteResult =
	| { ok: true; target: string }
	| { ok: false; errors: string[] };

export function writeReleaseStreams(
	incoming: Record<string, unknown>[],
	scope: ConfigKeyScope,
): WriteResult {
	return writeConfigKeys(
		[
			{
				key: "releases.streams",
				value: mergeRepoStreams(declaredStreamsInScope(scope), incoming),
			},
		],
		scope,
	);
}
