import { backlogTarget } from "../../../../../../backlogTarget";
import { cardCloseClassName } from "../../../../../cardCloseClassName";
import { DiscardButton } from "./CardCloseActions/DiscardButton";
import { DismissButton } from "../../../../../DismissButton";
import { RestartButton } from "../../../../../RestartButton";
import type {
	ChildDismiss,
	DismissOptions,
	SessionInfo,
} from "../../../../../../types";

export function CardCloseActions({
	session,
	onRestart,
	onStartOver,
	onDismiss,
	childDismiss,
}: {
	session: SessionInfo;
	onRestart?: () => void;
	onStartOver?: () => void;
	onDismiss: (opts?: DismissOptions) => void;
	childDismiss?: ChildDismiss;
}) {
	const { status, id, harness } = session;
	if (session.closing) return null;
	if (status !== "stopped") {
		const target = backlogTarget(session);
		return (
			<span className={cardCloseClassName}>
				<DismissButton
					id={id}
					status={status}
					onDismiss={onDismiss}
					childDismiss={childDismiss}
					backlog={target && { target, cwd: session.cwd, node: session.node }}
				/>
			</span>
		);
	}
	return (
		<>
			{session.undurable && (
				<span className={cardCloseClassName}>
					<DiscardButton
						id={id}
						reason={session.undurable.reason}
						path={session.cwd}
						removesTree={session.undurable.removesTree}
					/>
				</span>
			)}
			{onRestart && (
				<RestartButton
					id={id}
					onRestart={onRestart}
					onStartOver={onStartOver}
					harness={harness}
				/>
			)}
		</>
	);
}
