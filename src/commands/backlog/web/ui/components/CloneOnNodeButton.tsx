import CloudDownloadIcon from "@mui/icons-material/CloudDownloadOutlined";
import { IconButton, Tooltip } from "@mui/material";
import { useLiveSessionsContext } from "../../../../sessions/web/ui/useLiveSessionsContext";
import { CloneConfirmation } from "./CloneConfirmation";
import type { ClonePrompt } from "./launchClone";
import { useCloneOnSelect } from "./useCloneOnSelect";
import { cloneTooltip } from "./cloneTooltip";

const clonableSx = { border: 1, borderStyle: "dashed" } as const;

export function CloneOnNodeButton({ target }: { target: ClonePrompt }) {
	const clone = useCloneOnSelect(useLiveSessionsContext());
	return (
		<>
			<Tooltip title={cloneTooltip(target.node, target.cloneTarget)}>
				<IconButton
					aria-label="Clone"
					size="small"
					sx={clonableSx}
					onClick={(event) => {
						event.stopPropagation();
						clone.requestClone(target);
					}}
				>
					<CloudDownloadIcon fontSize="small" />
				</IconButton>
			</Tooltip>
			<CloneConfirmation clone={clone} />
		</>
	);
}
