import type { PrPreview } from "../../../../shared/SessionInfoBase";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { SessionTextSizeTheme } from "../SessionTextSizeTheme";
import { PrPreviewSlideInPane } from "../SessionContent/PrPreviewSlideInPane";

export function CardPendingPreview({
	preview,
	session,
	socket,
}: {
	preview: PrPreview;
	session: SessionInfo;
	socket: SessionSocket;
}) {
	return (
		<SessionTextSizeTheme>
			<PrPreviewSlideInPane
				key={preview.requestId}
				preview={preview}
				session={session}
				sessionId={session.id}
				cwd={session.cwd}
				sendInput={socket.sendInput}
				onDecision={(decision, details) =>
					socket.sendPrDecision(
						session.id,
						preview.requestId,
						decision,
						details,
					)
				}
			/>
		</SessionTextSizeTheme>
	);
}
