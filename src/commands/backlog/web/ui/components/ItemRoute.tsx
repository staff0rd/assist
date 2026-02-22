import type { BacklogItem } from "../types";
import { ItemDetail } from "./ItemDetail";
import { ItemForm } from "./ItemForm";
import type { View } from "./ViewRouter";

type NavigateFn = (view: View) => void;

export function ItemRoute({
	item,
	view,
	onNavigate,
	onReloadAndNavigate,
}: {
	item: BacklogItem;
	view: { kind: "detail" | "edit"; id: number };
	onNavigate: NavigateFn;
	onReloadAndNavigate: NavigateFn;
}) {
	if (view.kind === "edit") {
		return (
			<ItemForm
				item={item}
				onSaved={(id) => onReloadAndNavigate({ kind: "detail", id })}
				onCancel={() => onNavigate({ kind: "detail", id: view.id })}
			/>
		);
	}
	return (
		<ItemDetail
			item={item}
			onBack={() => onNavigate({ kind: "list" })}
			onEdit={() => onNavigate({ kind: "edit", id: view.id })}
			onDeleted={() => onReloadAndNavigate({ kind: "list" })}
		/>
	);
}
