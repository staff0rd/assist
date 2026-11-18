import type { SessionInfo } from "../../types";

export type BoardGroupProps = {
	sessions: SessionInfo[];
	openId: string | undefined;
	onOpen: (id: string) => void;
};
