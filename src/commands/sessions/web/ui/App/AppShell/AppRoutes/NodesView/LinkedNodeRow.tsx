import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useState } from "react";
import type { LinkStatus } from "../../../../../../daemon/links/LinkStatus";
import { linkStateTone } from "../../../../PhoneShell/PhoneNodesSheet/linkStateTone";
import { LinkDetail } from "./LinkedNodeRow/LinkDetail";
import { linkCaption } from "./LinkedNodeRow/linkCaption";
import { linkStateLabel } from "./LinkedNodeRow/linkStateLabel";
import { RemoveConfirm } from "./LinkedNodeRow/RemoveConfirm";
import { NodeNameText } from "./NodeNameText";
import { NodeRowCells } from "./NodeRowCells";
import { nodeRowSx } from "./nodeRowSx";

type LinkedNodeRowProps = {
	link: LinkStatus;
	onRemove: (name: string) => Promise<void>;
};

export function LinkedNodeRow({ link, onRemove }: LinkedNodeRowProps) {
	const [confirming, setConfirming] = useState(false);
	const [busy, setBusy] = useState(false);
	const remove = async () => {
		setBusy(true);
		try {
			await onRemove(link.name);
		} finally {
			setBusy(false);
			setConfirming(false);
		}
	};
	return (
		<Box component="article" aria-label={link.name} sx={nodeRowSx(link.state)}>
			<NodeRowCells
				tone={linkStateTone[link.state]}
				name={<NodeNameText name={link.name} />}
				url={link.url}
				state={linkStateLabel[link.state]}
				caption={linkCaption(link)}
				actions={
					!confirming && (
						<Button
							size="small"
							color="inherit"
							aria-label={`Remove ${link.name}`}
							onClick={() => setConfirming(true)}
						>
							Remove
						</Button>
					)
				}
			/>
			<LinkDetail link={link} />
			{confirming && (
				<RemoveConfirm
					name={link.name}
					busy={busy}
					onKeep={() => setConfirming(false)}
					onRemove={remove}
				/>
			)}
		</Box>
	);
}
