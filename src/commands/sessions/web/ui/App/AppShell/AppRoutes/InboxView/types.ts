export type InboxMessage = {
	id: string;
	source: string;
	sender: string;
	summary: string;
	link: string;
	receivedAt: string;
};

export type InboxStatus = {
	scanning: boolean;
	intervalMinutes: number | null;
	lastError: string | null;
	lastScanAt: string | null;
};
