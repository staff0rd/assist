import type { BacklogItem } from "../types";
import { ItemDetail } from "./ItemDetail";
import { ItemForm } from "./ItemForm";
import { ItemList } from "./ItemList";

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
