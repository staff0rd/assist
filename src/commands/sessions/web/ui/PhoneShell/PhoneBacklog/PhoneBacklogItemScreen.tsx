import Box from "@mui/material/Box";
import { formatItemId } from "../../../../../backlog/formatItemId";
import type { BacklogItem } from "../../../../../backlog/web/ui/types";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneBackButton } from "../PhoneBackButton";
import { PhoneNavBar } from "../PhoneNavBar";
import { phoneEmptySx } from "../phoneEmptySx";
import type { BacklogItemScope } from "./backlogItemPath";
import { PhoneItemBody } from "./PhoneItemBody";
import { PhoneStartBar } from "./PhoneStartBar";
import { usePhoneBacklogItem } from "./usePhoneBacklogItem";
import { usePhoneStart } from "./usePhoneStart";
import { canPlay } from "../../../../../backlog/web/ui/components/canPlay";

function LoadedItem({
	socket,
	item,
	scope,
}: {
	socket: SessionSocket;
	item: BacklogItem;
	scope: BacklogItemScope;
}) {
	const start = usePhoneStart(socket, item, scope);
	return (
		<>
			<PhoneItemBody item={item} scope={scope} />
			{canPlay(item) && <PhoneStartBar item={item} start={start} />}
		</>
	);
}

export function PhoneBacklogItemScreen({ socket }: { socket: SessionSocket }) {
	const { id, scope, load } = usePhoneBacklogItem();
	return (
		<>
			<PhoneNavBar
				left={<PhoneBackButton label="Back" />}
				title={id === undefined ? "Backlog" : formatItemId(id)}
			/>
			{load.state === "loaded" ? (
				<LoadedItem socket={socket} item={load.item} scope={scope} />
			) : (
				<Box sx={phoneEmptySx}>
					{load.state === "loading"
						? "Loading…"
						: load.state === "error"
							? load.message
							: "Item not found"}
				</Box>
			)}
		</>
	);
}
