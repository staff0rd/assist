import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineRounded";
import ButtonBase from "@mui/material/ButtonBase";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";
import { clearClientFailures } from "../../../clientFailures/recordClientFailure";
import { useClientFailures } from "../../../clientFailures/useClientFailures";
import { ClientFailuresPanel } from "./ClientFailuresBadge/ClientFailuresPanel";
import { clientFailuresBadgeSx } from "./ClientFailuresBadge/clientFailuresBadgeSx";

export function ClientFailuresBadge() {
	const failures = useClientFailures();
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	if (failures.length === 0) return null;
	const label = `${failures.length} failed request${failures.length > 1 ? "s" : ""}`;
	return (
		<>
			<Tooltip title={label} placement="top-end">
				<ButtonBase
					aria-label={label}
					sx={clientFailuresBadgeSx}
					onClick={(e) => setAnchorEl(e.currentTarget)}
				>
					<ErrorOutlineIcon sx={{ fontSize: 14 }} />
					<span>{failures.length}</span>
				</ButtonBase>
			</Tooltip>
			<Popover
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={() => setAnchorEl(null)}
				anchorOrigin={{ vertical: "top", horizontal: "right" }}
				transformOrigin={{ vertical: "bottom", horizontal: "right" }}
			>
				<ClientFailuresPanel
					failures={failures}
					onClear={() => {
						clearClientFailures();
						setAnchorEl(null);
					}}
				/>
			</Popover>
		</>
	);
}
