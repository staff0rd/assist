import Container from "@mui/material/Container";
import { BacklogView } from "../../../../../../backlog/web/ui/BacklogView";
import type { SessionSocket } from "../../../useSessionSocket";

export function BacklogContent({ socket }: { socket: SessionSocket }) {
	return (
		<Container maxWidth="lg" sx={{ py: 3, px: 2 }}>
			<BacklogView socket={socket} />
		</Container>
	);
}
