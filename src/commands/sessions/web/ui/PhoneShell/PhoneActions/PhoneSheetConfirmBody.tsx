import type { ReactNode } from "react";
import { backlogTarget } from "../../backlogTarget";
import type { DismissOptions, SessionInfo } from "../../types";
import { PhoneEndConfirm } from "./PhoneEndConfirm";
import { PhoneMarkDoneConfirm } from "./PhoneMarkDoneConfirm";
import type { PhoneSheetConfirm } from "./PhoneSheetConfirm";

type Props = {
	confirm: PhoneSheetConfirm | undefined;
	session: SessionInfo;
	node: string | undefined;
	onConfirmed: (opts?: DismissOptions) => void;
	onCancel: () => void;
	children: ReactNode;
};

export function PhoneSheetConfirmBody({
	confirm,
	session,
	node,
	onConfirmed,
	onCancel,
	children,
}: Props) {
	if (confirm === "end")
		return <PhoneEndConfirm onEnd={() => onConfirmed()} onCancel={onCancel} />;
	const target = confirm === "markDone" ? backlogTarget(session) : undefined;
	if (!target) return children;
	return (
		<PhoneMarkDoneConfirm
			target={target}
			cwd={session.cwd}
			node={node}
			onDone={() => onConfirmed({ closeServerRuns: true })}
			onCancel={onCancel}
		/>
	);
}
