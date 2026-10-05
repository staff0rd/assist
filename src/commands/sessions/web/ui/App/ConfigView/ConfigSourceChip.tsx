import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import type { ConfigSource } from "../../../../../config/resolveConfigSources";

const DESCRIPTIONS: Record<ConfigSource, string> = {
	project: "Set in this repo's assist.yml",
	repo: "Pinned by this repo's override in the shared db, seen by every node — a plain global value cannot change it",
	global: "Set in ~/.assist.yml",
	default: "Not set in any file — using the schema default",
};

function repoDescription(repoKey: string, repoSource?: "db" | "yml"): string {
	return repoSource === "yml"
		? `Pinned by repos.${repoKey} in this node's ~/.assist.yml, which other nodes don't see — run 'assist config import-repos' to share it`
		: `Pinned by repos.${repoKey} in the shared db, seen by every node — a plain global value cannot change it`;
}

export function ConfigSourceChip({
	source,
	repoKey,
	repoSource,
}: {
	source: ConfigSource;
	repoKey?: string;
	repoSource?: "db" | "yml";
}) {
	const description =
		source === "repo" && repoKey
			? repoDescription(repoKey, repoSource)
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
				label={source}
			/>
		</Tooltip>
	);
}
