import Link from "@mui/material/Link";
import type { ConversationTarget } from "../../../../shared/sessionConversationTarget";
import { BRANCH_DIFF_SCOPE } from "../diffScopeOptions";
import { useOpenDiffPanel } from "./useOpenDiffPanel";

export function BranchDiffLink({
	panelSessionId,
	cwd,
	conversation,
	defaultBranch,
}: {
	panelSessionId: string;
	cwd: string;
	conversation?: ConversationTarget;
	defaultBranch: string;
}) {
	const openPanel = useOpenDiffPanel(panelSessionId, cwd, conversation);
	const label = `Diff against ${defaultBranch}`;

	return (
		<Link
			component="button"
			type="button"
			title={label}
			aria-label={label}
			onClick={() => openPanel(BRANCH_DIFF_SCOPE)}
			variant="caption"
			underline="hover"
			color="inherit"
			sx={{
				border: 0,
				p: 0,
				bgcolor: "transparent",
				cursor: "pointer",
				fontFamily: "fontFamilyMono",
				whiteSpace: "nowrap",
				color: "text.disabled",
				"&:hover": { color: "text.primary" },
			}}
		>
			vs {defaultBranch}
		</Link>
	);
}
