import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import type { SessionInfo } from "../../types";
import { isFinished } from "./isFinished";
import { PhoneSwipeActions, SWIPE_ACTION_WIDTH } from "./PhoneSwipeActions";
import { usePhoneActions } from "./usePhoneActions";
import { useRowGestures } from "./useRowGestures";

const wrapSx = {
	position: "relative",
	overflow: "hidden",
	touchAction: "pan-y",
	userSelect: "none",
	WebkitUserSelect: "none",
	WebkitTouchCallout: "none",
} as const;

const slideSx = {
	position: "relative",
	bgcolor: "background.default",
} as const;

export function PhoneSwipeRow({
	session,
	children,
}: {
	session: SessionInfo;
	children: (consumeClick: () => boolean) => ReactNode;
}) {
	const actions = usePhoneActions();
	const gestures = useRowGestures(2 * SWIPE_ACTION_WIDTH, () =>
		actions.openSheet(session),
	);
	const finished = isFinished(session);
	const after = (run: () => void) => () => {
		gestures.close();
		run();
	};

	return (
		<Box sx={wrapSx} {...gestures.handlers}>
			<PhoneSwipeActions
				finished={finished}
				starred={actions.isStarred(session)}
				onStar={after(() => actions.toggleStar(session))}
				onEnd={after(() =>
					finished
						? actions.dismiss(session)
						: actions.openSheet(session, "end"),
				)}
			/>
			<Box
				sx={slideSx}
				style={{
					transform: `translateX(${gestures.offset}px)`,
					transition: gestures.dragging ? "none" : "transform 0.2s ease",
				}}
			>
				{children(gestures.consumeClick)}
			</Box>
		</Box>
	);
}
