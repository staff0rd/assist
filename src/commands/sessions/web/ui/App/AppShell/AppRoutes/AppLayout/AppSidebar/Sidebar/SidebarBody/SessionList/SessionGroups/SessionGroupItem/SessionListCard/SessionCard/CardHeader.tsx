import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { areChipsLoading } from "./areChipsLoading";
import { CardHeaderActions } from "./CardHeader/CardHeaderActions";
import { displayStatus } from "../../../../../../../../../displayStatus";
import { isVerifying } from "../../../../../../../../../isVerifying";
import { SessionStatusGlyph } from "./CardHeader/SessionStatusGlyph";
import { SessionVerifyRing } from "./CardHeader/SessionVerifyRing";
import { sessionTitle } from "../../../../../../../../../sessionTitle";
import type { CardHeaderProps } from "../../../../../../../../../../../../types";

const spinnerSx = { gridColumn: 1, gridRow: 1, justifySelf: "center" } as const;

const busySx = { gridColumn: 2, gridRow: 2, color: "text.disabled" } as const;

const titleSx = {
	gridColumn: 2,
	gridRow: 1,
	color: "text.primary",
	fontSize: "0.845rem",
	lineHeight: "20px",
	minWidth: 0,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;

function StatusRail({
	session,
	loading,
}: Pick<CardHeaderProps, "session" | "loading">) {
	if (areChipsLoading(session, loading))
		return <CircularProgress size={11} sx={spinnerSx} />;
	if (isVerifying(session)) return <SessionVerifyRing />;
	return <SessionStatusGlyph status={displayStatus(session)} />;
}

export function CardHeader({
	session,
	loading,
	onRetry,
	onRestart,
	onDismiss,
}: CardHeaderProps) {
	return (
		<>
			<StatusRail session={session} loading={loading} />
			<Typography variant="body2" sx={titleSx}>
				{sessionTitle(session)}
			</Typography>
			<CardHeaderActions
				session={session}
				loading={loading}
				onRetry={onRetry}
				onRestart={onRestart}
				onDismiss={onDismiss}
			/>
			{loading && (
				<Typography variant="caption" sx={busySx}>
					{session.closing ? "Closing…" : "Starting…"}
				</Typography>
			)}
		</>
	);
}
