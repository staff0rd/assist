import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import { configScopeNames } from "../../../../../config/configScopeNames";
import type { ConfigSource } from "../../../../../config/resolveConfigSources";

const DESCRIPTIONS: Record<ConfigSource, string> = {
	project: "Set in this repo's assist.yml (repo (git), every node)",
	repo: "Pinned by this repo's override in the shared db, seen by every node — a user (node) or user (db) value cannot change it",
	global: "Set in ~/.assist.yml (this node only)",
	user: "Set in the shared db, seen by every repo on every node",
	default: "Not set in any scope — using the schema default",
};

function repoDescription(repoKey: string, repoSource?: "db" | "yml"): string {
	return repoSource === "yml"
		? `Pinned by repos.${repoKey} in this node's ~/.assist.yml, which other nodes don't see — run 'assist config import-repos' to share it`
		: `Pinned by repos.${repoKey} in the shared db, seen by every node — a user (node) or user (db) value cannot change it`;
}

export function ConfigSourceChip({
	source,
	repoKey,
	repoSource,
	globalConfigFile,
}: {
	source: ConfigSource;
	repoKey?: string;
	repoSource?: "db" | "yml";
	globalConfigFile?: string;
}) {
	const description =
		source === "repo" && repoKey
			? repoDescription(repoKey, repoSource)
			: source === "global" && globalConfigFile
				? `Set in ${globalConfigFile} (this node only)`
				: DESCRIPTIONS[source];

	return (
		<Tooltip title={description}>
			<Chip
				size="small"
				variant={source === "default" ? "outlined" : "filled"}
				color={
					source === "default"
						? "default"
						: source === "repo"
							? "warning"
							: "primary"
				}
				label={source === "default" ? "default" : configScopeNames[source]}
			/>
		</Tooltip>
	);
}
