import { inboxScanTools } from "./inboxScanTools";
import { openedThreadId } from "./openedThreadId";
import { searchResultThreadIds } from "./searchResultThreadIds";

type Block = {
	type?: unknown;
	id?: unknown;
	name?: unknown;
	input?: unknown;
	tool_use_id?: unknown;
	content?: unknown;
};

function blocks(content: unknown): Block[] {
	return Array.isArray(content) ? (content as Block[]) : [];
}

export function createGmailCoverage() {
	const searches = new Set<string>();
	const found = new Set<string>();
	const opened = new Set<string>();

	const onToolUse = (block: Block) => {
		if (block.name === inboxScanTools.gmailSearch)
			searches.add(String(block.id));
		else if (block.name === inboxScanTools.gmailGetThread) {
			const id = openedThreadId(block.input);
			if (id) opened.add(id);
		}
	};

	return {
		onAssistant(content: unknown): void {
			for (const block of blocks(content))
				if (block.type === "tool_use") onToolUse(block);
		},
		onUser(content: unknown): void {
			for (const block of blocks(content))
				if (searches.has(String(block.tool_use_id)))
					for (const id of searchResultThreadIds(block.content)) found.add(id);
		},
		current: () => ({ found: [...found], opened: [...opened] }),
	};
}
