import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import type { ConfigSource } from "../../../../../config/resolveConfigSources";

const DESCRIPTIONS: Record<ConfigSource, string> = {
	project: "Set in this repo's assist.yml",
	repo: "Pinned by a repos override in ~/.assist.yml — a plain global value cannot change it",
	global: "Set in ~/.assist.yml",
	default: "Not set in any file — using the schema default",
};

export function ConfigSourceChip({
	source,
	repoKey,
}: {
	source: ConfigSource;
	repoKey?: string;
}) {
	const description =
		source === "repo" && repoKey
			? `Pinned by repos.${repoKey} in ~/.assist.yml — a plain global value cannot change it`
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
