import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Box, Link } from "@mui/material";

export function ViewOnGithubLink({
	repo,
	prNumber,
}: {
	repo: string;
	prNumber: number;
}) {
	return (
		<Box sx={{ borderTop: 1, borderColor: "divider", pt: 1 }}>
			<Link
				href={`https://github.com/${repo}/pull/${prNumber}`}
				target="_blank"
				rel="noopener noreferrer"
				variant="caption"
				sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
			>
				View on GitHub
				<OpenInNewIcon sx={{ fontSize: 12 }} />
			</Link>
		</Box>
	);
}
