import GitHubIcon from "@mui/icons-material/GitHub";
import type { PrSummary } from "../../../../../../prList";
import { ActionButton } from "../../../ActionButton";

export function OpenPrButton({ pr }: { pr: PrSummary }) {
	if (!pr.url) return null;

	return (
		<ActionButton
			label="PR"
			title="Open PR"
			icon={<GitHubIcon sx={{ fontSize: 14 }} />}
			onClick={(e) => {
				e.stopPropagation();
				window.open(pr.url, "_blank");
			}}
		/>
	);
}
