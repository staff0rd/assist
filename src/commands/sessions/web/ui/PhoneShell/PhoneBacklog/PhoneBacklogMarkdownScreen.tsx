import Box from "@mui/material/Box";
import { MarkdownBlock } from "../../../../../backlog/web/ui/components/MarkdownBlock";
import type { BacklogItem } from "../../../../../backlog/web/ui/types";
import { safeAreaInsets } from "../../designSystem/safeAreaInsets";
import { PhoneBackButton } from "../PhoneBackButton";
import { PhoneNavBar } from "../PhoneNavBar";
import { phoneEmptySx } from "../phoneEmptySx";
import { usePhoneBacklogItem } from "./usePhoneBacklogItem";

type Page = "description" | "criteria";

const bodySx = {
	flex: 1,
	minHeight: 0,
	overflowY: "auto",
	WebkitOverflowScrolling: "touch",
	px: 2,
	pt: 1,
	pb: safeAreaInsets.bottom,
	fontSize: 15,
	overflowWrap: "anywhere",
} as const;

const titles: Record<Page, string> = {
	description: "Description",
	criteria: "Acceptance criteria",
};

function pageMarkdown(item: BacklogItem, page: Page): string {
	if (page === "description") return item.description ?? "";
	return item.acceptanceCriteria
		.map((criterion, i) => `${i + 1}. ${criterion}`)
		.join("\n");
}

export function PhoneBacklogMarkdownScreen({ page }: { page: Page }) {
	const { load } = usePhoneBacklogItem();
	return (
		<>
			<PhoneNavBar
				left={<PhoneBackButton label="Item" />}
				title={titles[page]}
			/>
			{load.state === "loaded" ? (
				<Box sx={bodySx}>
					<MarkdownBlock
						content={pageMarkdown(load.item, page)}
						renderMermaid={page === "description"}
					/>
				</Box>
			) : (
				<Box sx={phoneEmptySx}>
					{load.state === "loading" ? "Loading…" : "Item not found"}
				</Box>
			)}
		</>
	);
}
