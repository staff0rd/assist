import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { repoName } from "../../../../repoName";

export function RepoSwitcher({
	repos,
	cwd,
	onPick,
}: {
	repos: string[];
	cwd: string;
	onPick: (cwd: string) => void;
}) {
	if (repos.length < 2) return null;
	return (
		<Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1, mb: 2 }}>
			{repos.map((repo) => (
				<Chip
					key={repo}
					size="small"
					label={repoName(repo)}
					color={repo === cwd ? "primary" : "default"}
					variant={repo === cwd ? "filled" : "outlined"}
					onClick={() => onPick(repo)}
				/>
			))}
		</Stack>
	);
}
