import GitHubIcon from "@mui/icons-material/GitHub";
import IconButton from "@mui/material/IconButton";
import type { PrSummary } from "../prList";

export function OpenPrButton({ pr }: { pr: PrSummary }) {
	if (!pr.url) return null;

	return (
		<IconButton
			size="small"
			onClick={(e) => {
				e.stopPropagation();
				window.open(pr.url, "_blank");
			}}
			title="Open PR"
			sx={{ color: "text.disabled", "&:hover": { color: "text.primary" } }}
		>
			<GitHubIcon sx={{ fontSize: 14 }} />
		</IconButton>
	);
}
