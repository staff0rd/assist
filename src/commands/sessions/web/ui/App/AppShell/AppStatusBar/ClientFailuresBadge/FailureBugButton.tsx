import BugReportIcon from "@mui/icons-material/BugReportOutlined";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import type { ClientFailure } from "../../../../../../shared/ClientFailure";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";
import { useSessionLaunchContext } from "../../../../useSessionLaunchContext";
import { assistVersion } from "../../assistVersion";
import { findAssistClone } from "./findAssistClone";
import { formatFailureBugPrompt } from "./formatFailureBugPrompt";

export function FailureBugButton({
	failure,
	onLaunched,
}: {
	failure: ClientFailure;
	onLaunched: () => void;
}) {
	const { repos, originOf, cloneOn, selectedNode } = useRepoSelectionContext();
	const { launchAssist } = useSessionLaunchContext();
	const anyClone = findAssistClone(repos, originOf);
	const cwd = anyClone && cloneOn(anyClone, selectedNode);
	const title = cwd
		? "Report this failure in a /bug session"
		: `No local clone of staff0rd/assist${selectedNode ? ` on ${selectedNode}` : ""} to report the bug in`;
	return (
		<Tooltip title={title}>
			<span>
				<IconButton
					size="small"
					aria-label="Report bug"
					disabled={!cwd}
					onClick={() => {
						if (!cwd) return;
						const prompt = formatFailureBugPrompt(
							failure,
							globalThis.location.href,
							assistVersion,
						);
						launchAssist(["bug", "--once", prompt], cwd, {
							node: selectedNode,
							title: `Bug: ${failure.method} ${failure.path}`,
						});
						onLaunched();
					}}
				>
					<BugReportIcon fontSize="inherit" />
				</IconButton>
			</span>
		</Tooltip>
	);
}
