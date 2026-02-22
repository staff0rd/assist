import type { BacklogItem } from "../types";
import { ItemForm } from "./ItemForm";
import { ItemList } from "./ItemList";
import { ItemRoute } from "./ItemRoute";

type View =
	| { kind: "list" }
	| { kind: "detail"; id: number }
	| { kind: "add" }
	| { kind: "edit"; id: number };

type ViewRouterProps = {
	view: View;
	items: BacklogItem[];
	onNavigate: (view: View) => void;
	onReloadAndNavigate: (view: View) => void;
};

export type { View };

export function ViewRouter({
	view,
	items,
	onNavigate,
	onReloadAndNavigate,
}: ViewRouterProps) {
	if (view.kind === "detail" || view.kind === "edit") {
		const item = items.find((i) => i.id === view.id);
		if (!item) return null;
		return (
			<ItemRoute
				item={item}
				view={view}
				onNavigate={onNavigate}
				onReloadAndNavigate={onReloadAndNavigate}
			/>
		);
	}

	if (view.kind === "add") {
		return (
			<ItemForm
				onSaved={() => onReloadAndNavigate({ kind: "list" })}
				onCancel={() => onNavigate({ kind: "list" })}
			/>
		);
	}

	return (
		<ItemList
			items={items}
			onSelect={(id) => onNavigate({ kind: "detail", id })}
			onAdd={() => onNavigate({ kind: "add" })}
		/>
	);
}
