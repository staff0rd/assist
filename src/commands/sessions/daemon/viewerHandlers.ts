import type { ViewerClaim } from "./claimViewer";
import { type Handler, type Msg, routed } from "./routed";
import { viewed } from "./viewed";

const viewerOf = (d: Msg): ViewerClaim => ({
	viewerId: d.viewerId as string | undefined,
	viewerNode: d.viewerNode as string | undefined,
});

export const viewerHandlers: Record<string, Handler> = {
	input: viewed(
		routed((_client, m, d) =>
			m.io.write(d.sessionId as string, d.data as string, viewerOf(d)),
		),
	),
	resize: viewed(
		routed((_client, m, d) =>
			m.io.resize(d.sessionId as string, d.cols as number, d.rows as number, {
				...viewerOf(d),
				claim: d.claim === true,
			}),
		),
	),
	"viewer-left": (client, m, d) => {
		if (typeof d.viewerId === "string") m.io.viewerLeft(client, d.viewerId);
	},
};
