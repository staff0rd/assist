import CircularProgress from "@mui/material/CircularProgress";
import { areChipsLoading } from "../areChipsLoading";
import { displayStatus } from "../../../../displayStatus";
import { isVerifying } from "../../../isVerifying";
import { SessionStatusGlyph } from "./SessionStatusGlyph";
import { SessionVerifyRing } from "./SessionVerifyRing";
import type { CardHeaderProps } from "../../../../types";
import { TransferGlyph } from "../../../../transfer/TransferGlyph";
import { transferIndicator } from "../../../../transfer/transferIndicator";

const spinnerSx = { gridColumn: 1, gridRow: 1, justifySelf: "center" } as const;

export function StatusRail({
	session,
	loading,
}: Pick<CardHeaderProps, "session" | "loading">) {
	if (areChipsLoading(session, loading))
		return <CircularProgress size={11} sx={spinnerSx} />;
	const transfer = transferIndicator(session);
	if (transfer) return <TransferGlyph {...transfer} />;
	if (isVerifying(session)) return <SessionVerifyRing />;
	return <SessionStatusGlyph status={displayStatus(session)} />;
}
