import { useState } from "react";
import { deleteItem } from "../api";
import type { BacklogItem } from "../types";
import { BackButton } from "./BackButton";
import { ConfirmDialog } from "./ConfirmDialog";
import { ItemBody } from "./ItemBody";

type ItemDetailProps = {
	item: BacklogItem;
	onBack: () => void;
	onEdit: () => void;
	onDeleted: () => void;
};

function DeleteAction({
	itemId,
	onDeleted,
}: {
	itemId: number;
	onDeleted: () => void;
}) {
	const [confirming, setConfirming] = useState(false);
	return (
		<>
			{confirming && (
				<ConfirmDialog
					onConfirm={async () => {
						await deleteItem(itemId);
						onDeleted();
					}}
					onCancel={() => setConfirming(false)}
				/>
			)}
			<button
				type="button"
				className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm font-medium cursor-pointer"
				onClick={() => setConfirming(true)}
			>
				Delete
			</button>
		</>
	);
}

function DetailHeader({
	itemId,
	onBack,
	onEdit,
	onDeleted,
}: {
	itemId: number;
	onBack: () => void;
	onEdit: () => void;
	onDeleted: () => void;
}) {
	return (
		<div className="flex justify-between items-center mb-4">
			<BackButton onClick={onBack} />
			<div className="flex gap-2">
				<button
					type="button"
					className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md px-4 py-2 text-sm font-medium cursor-pointer"
					onClick={onEdit}
				>
					Edit
				</button>
				<DeleteAction itemId={itemId} onDeleted={onDeleted} />
			</div>
		</div>
	);
}

export function ItemDetail({
	item,
	onBack,
	onEdit,
	onDeleted,
}: ItemDetailProps) {
	return (
		<>
			<DetailHeader
				itemId={item.id}
				onBack={onBack}
				onEdit={onEdit}
				onDeleted={onDeleted}
			/>
			<ItemBody item={item} />
		</>
	);
}
