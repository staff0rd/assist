import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import IconButton from "@mui/material/IconButton";
import type { SessionInfo } from "../../types";
import { usePhoneActions } from "./usePhoneActions";

export function PhoneMoreButton({ session }: { session: SessionInfo }) {
	const { openSheet } = usePhoneActions();
	return (
		<IconButton
			aria-label="Session actions"
			sx={{ color: "primary.main" }}
			onClick={() => openSheet(session)}
		>
			<MoreHorizIcon />
		</IconButton>
	);
}
