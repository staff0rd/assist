import { Banner } from "./Banner";
import ScheduleIcon from "@mui/icons-material/Schedule";
import Button from "@mui/material/Button";
import type { SessionInfo } from "../types";
import { useTransferContext } from "./useTransferContext";

export function QueuedBanner({ session }: { session: SessionInfo }) {
	const { cancel } = useTransferContext();
	return (
		<Banner
			tone="warning"
			icon={<ScheduleIcon fontSize="small" />}
			message={`Transfer to ${session.transfer?.target} queued — starts once the agent is idle`}
		>
			<Button size="small" color="warning" onClick={() => cancel(session.id)}>
				Cancel transfer
			</Button>
		</Banner>
	);
}
