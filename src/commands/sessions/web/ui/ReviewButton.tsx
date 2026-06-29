import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import { useSessionLaunchContext } from "./useSessionLaunchContext";

const MODES: { label: string; args: string[] }[] = [
	{ label: "Review", args: ["review"] },
	{ label: "Review (force re-run)", args: ["review", "--force"] },
	{ label: "Review & refine", args: ["review", "--refine"] },
	{ label: "Review & apply", args: ["review", "--apply"] },
];

export function ReviewButton({ cwd }: { cwd: string }) {
	const { launchAssist } = useSessionLaunchContext();
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);

	return (
		<>
			<IconButton
				size="small"
				onClick={(e) => {
					e.stopPropagation();
					setAnchorEl(e.currentTarget);
				}}
				title="Review PR"
				sx={{ color: "text.disabled", "&:hover": { color: "text.primary" } }}
			>
				<RateReviewOutlinedIcon sx={{ fontSize: 14 }} />
			</IconButton>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={() => setAnchorEl(null)}
				onClick={(e) => e.stopPropagation()}
			>
				{MODES.map((mode) => (
					<MenuItem
						key={mode.label}
						onClick={(e) => {
							e.stopPropagation();
							setAnchorEl(null);
							launchAssist(mode.args, cwd);
						}}
					>
						{mode.label}
					</MenuItem>
				))}
			</Menu>
		</>
	);
}
