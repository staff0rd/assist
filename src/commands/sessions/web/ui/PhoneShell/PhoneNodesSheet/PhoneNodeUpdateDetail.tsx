import Box from "@mui/material/Box";
import { useState } from "react";
import { updateState } from "../../App/AppShell/AppRoutes/UpdatesView/updateState";
import type { NodeUpdateEntry } from "../../App/AppShell/NodeUpdateEntry";
import { phoneUpdateState } from "../PhoneNodeUpdates/phoneUpdateState";
import type { PhoneNodeUpdates } from "../PhoneNodeUpdates/usePhoneNodeUpdates";
import { PhoneNodeUpdateButtons } from "./PhoneNodeUpdateButtons";
import {
	PhoneNodeUpdateConfirm,
	type UpdateConfirm,
} from "./PhoneNodeUpdateConfirm";
import { PhoneNodeUpdateProgress } from "./PhoneNodeUpdateProgress";
import { PhoneNodeUpdateVersions } from "./PhoneNodeUpdateVersions";
import { PhoneUpdateMessages } from "./PhoneUpdateMessages";
import { phoneUpdateNoteSx } from "./phoneUpdateNoteSx";

type Props = { entry: NodeUpdateEntry; updates: PhoneNodeUpdates };

export function PhoneNodeUpdateDetail({ entry, updates }: Props) {
	const [confirm, setConfirm] = useState<UpdateConfirm | null>(null);
	const busy = updates.notices.busy[entry.name];
	const state = phoneUpdateState(entry, updates.latest);
	const run = (action: UpdateConfirm) => {
		setConfirm(null);
		updates.clearMessages();
		void (action === "update" ? updates.update : updates.restart)(entry);
	};

	return (
		<>
			<PhoneNodeUpdateVersions entry={entry} latest={updates.latest} />
			<Box sx={phoneUpdateNoteSx}>
				{state.detail} · {updateState(entry).line}
			</Box>
			{busy && <PhoneNodeUpdateProgress busy={busy} />}
			<PhoneUpdateMessages back={updates.notices.back} error={updates.error} />
			{confirm ? (
				<PhoneNodeUpdateConfirm
					entry={entry}
					confirm={confirm}
					onConfirm={() => run(confirm)}
					onCancel={() => setConfirm(null)}
				/>
			) : (
				<PhoneNodeUpdateButtons
					entry={entry}
					state={state}
					latest={updates.latest}
					busy={!!busy}
					onConfirm={setConfirm}
					onCheck={() => void updates.check(entry)}
				/>
			)}
		</>
	);
}
