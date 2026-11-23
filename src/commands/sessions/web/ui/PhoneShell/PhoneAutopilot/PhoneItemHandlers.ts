export type PhoneItemHandlers = {
	busy: boolean;
	onItem: (itemId: number) => void;
	onStop: (itemId?: number) => void;
	onOpen: (sessionId: string) => void;
	onResume: (itemId: number) => void;
};
