import type { OnTooVerbose } from "./TranscriptArea/TranscriptPane/useReplyActions";
import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { TranscriptPane } from "./TranscriptArea/TranscriptPane";
import type { Transcript } from "../../../types";
import { useTranscriptHighlightTerm } from "../../useHistorySearchQuery";
import { splitNodeSessionId } from "../../../../../daemon/links/splitNodeSessionId";
import { TranscriptNodeContext } from "./TranscriptArea/useTranscriptNodeContext";

export function TranscriptArea({
	sessionId,
	node,
	transcript,
	tail,
	follow,
	followSignal,
	commentLayer,
	onTooVerbose,
}: {
	sessionId: string;
	node?: string;
	transcript: Transcript | null;
	tail?: ReactNode;
	follow?: boolean;
	followSignal?: number;
	commentLayer?: (content: ReactNode) => ReactNode;
	onTooVerbose?: OnTooVerbose;
}) {
	const term = useTranscriptHighlightTerm();
	const ready = transcript?.sessionId === sessionId;
	return (
		<TranscriptNodeContext.Provider
			value={node ?? splitNodeSessionId(sessionId)?.node}
		>
			<Box
				sx={{ flex: 1, position: "relative", bgcolor: "background.default" }}
			>
				<TranscriptPane
					messages={ready ? (transcript?.messages ?? []) : []}
					loading={!ready}
					term={term}
					tail={tail}
					follow={follow}
					followSignal={followSignal}
					commentLayer={commentLayer}
					onTooVerbose={onTooVerbose}
				/>
			</Box>
		</TranscriptNodeContext.Provider>
	);
}
