import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import type { PrSummary } from "../prList";
import { prLaunchMeta } from "./prLaunchMeta";
import { reviewButtonModes } from "./reviewButtonModes";
import { useSessionLaunchContext } from "./useSessionLaunchContext";

export function ReviewButton({ cwd, pr }: { cwd: string; pr: PrSummary }) {
	const { launchAssist } = useSessionLaunchContext();
	const meta = prLaunchMeta(pr);
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
				{reviewButtonModes.map((mode) => (
					<MenuItem
						key={mode.label}
						onClick={(e) => {
							e.stopPropagation();
							setAnchorEl(null);
							launchAssist(mode.args, cwd, meta);
						}}
					>
						{mode.label}
					</MenuItem>
				))}
				<Divider />
				<MenuItem
					onClick={(e) => {
						e.stopPropagation();
						setAnchorEl(null);
						launchAssist(["review-comments", String(pr.number)], cwd, meta);
					}}
				>
					Address Comments
				</MenuItem>
			</Menu>
		</>
	);
}
