import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import IconButton from "@mui/material/IconButton";
import type { SessionInfo } from "./types";
import { useStarredSessions } from "./useStarredSessions";

export function SessionStarButton({ session }: { session: SessionInfo }) {
	const { isStarred, toggleStar } = useStarredSessions();
	const starred = isStarred(session);
	return (
		<IconButton
			size="small"
			onClick={(e) => {
				e.stopPropagation();
				toggleStar(session);
			}}
			title={starred ? "Unstar" : "Star"}
			aria-label={starred ? "Unstar" : "Star"}
			aria-pressed={starred}
			sx={{
				color: starred ? "warning.main" : "text.disabled",
				"&:hover": { color: starred ? "warning.main" : "text.primary" },
			}}
		>
			{starred ? (
				<StarIcon sx={{ fontSize: 16 }} />
			) : (
				<StarBorderIcon sx={{ fontSize: 16 }} />
			)}
		</IconButton>
	);
}
