import Link from "@mui/material/Link";
import { BRANCH_DIFF_SCOPE } from "../diffScopeOptions";
import { useDiffPanels } from "../useDiffPanels";

export function BranchDiffLink({
	panelSessionId,
	cwd,
	sessionId,
	defaultBranch,
}: {
	panelSessionId: string;
	cwd: string;
	sessionId?: string;
	defaultBranch: string;
}) {
	const { togglePanel } = useDiffPanels();
	const label = `Diff against ${defaultBranch}`;

	return (
		<Link
			component="button"
			type="button"
			title={label}
			aria-label={label}
			onClick={() =>
				togglePanel(panelSessionId, {
					cwd,
					claudeSessionId: sessionId,
					scope: BRANCH_DIFF_SCOPE,
				})
			}
			variant="caption"
			underline="hover"
			color="inherit"
			sx={{
				border: 0,
				p: 0,
				bgcolor: "transparent",
				cursor: "pointer",
				fontFamily: "monospace",
				whiteSpace: "nowrap",
				color: "text.disabled",
				"&:hover": { color: "text.primary" },
			}}
		>
			vs {defaultBranch}
		</Link>
	);
}
