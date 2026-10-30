import Stack from "@mui/material/Stack";
import { useEffect } from "react";
import { PageShell } from "../../PageShell";
import { InboxHeader } from "./InboxView/InboxHeader";
import { InboxItem } from "./InboxView/InboxItem";
import { inboxStore } from "./InboxView/inboxStore";
import { useInboxMessages } from "./InboxView/useInboxMessages";

export function InboxView() {
	const messages = useInboxMessages();

	useEffect(() => {
		void inboxStore.refresh();
		void inboxStore.refreshStatus();
	}, []);

	return (
		<PageShell
			loading={messages === undefined}
			header={<InboxHeader />}
			isEmpty={messages?.length === 0}
			emptyMessage="No messages need a reply."
		>
			<Stack spacing={1}>
				{messages?.map((message) => (
					<InboxItem
						key={message.id}
						message={message}
						onDismiss={() => void inboxStore.dismiss(message.id)}
					/>
				))}
			</Stack>
		</PageShell>
	);
}
