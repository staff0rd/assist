import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { ActionButton } from "../../ActionButton";
import type { SessionInfo } from "../../../../types";
import { useStarredSessions } from "../useStarredSessions";

export function SessionStarButton({ session }: { session: SessionInfo }) {
	const { isStarred, toggleStar } = useStarredSessions();
	const starred = isStarred(session);
	return (
		<ActionButton
			label={starred ? "Unstar" : "Star"}
			title={starred ? "Unstar" : "Star"}
			tone={starred ? "starred" : "muted"}
			pressed={starred}
			icon={
				starred ? (
					<StarIcon sx={{ fontSize: 16 }} />
				) : (
					<StarBorderIcon sx={{ fontSize: 16 }} />
				)
			}
			onClick={(e) => {
				e.stopPropagation();
				toggleStar(session);
			}}
		/>
	);
}
