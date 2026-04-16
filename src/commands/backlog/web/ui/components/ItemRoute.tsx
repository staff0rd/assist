import { useParams } from "react-router";
import type { BacklogItem } from "../types";
import { ItemDetail } from "./ItemDetail";
import { ItemForm } from "./ItemForm";

export function ItemRoute({
	items,
	mode,
	onReload,
}: {
	items: BacklogItem[];
	mode: "detail" | "edit";
	onReload: () => Promise<void>;
}) {
	const { id } = useParams<{ id: string }>();
	const numId = Number(id);
	const item = items.find((i) => i.id === numId);
	if (!item) return null;

	if (mode === "edit") {
		return (
			<ItemForm
				item={item}
				onReload={onReload}
				backTo={`/backlog/items/${numId}`}
			/>
		);
	}
	return <ItemDetail item={item} onReload={onReload} />;
}
