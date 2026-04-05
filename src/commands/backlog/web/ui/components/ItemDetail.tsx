import { useState } from "react";
import { useNavigate } from "react-router";
import { deleteItem, updateItemStatus } from "../api";
import type { BacklogItem } from "../types";
import { BackButton } from "./BackButton";
import { ConfirmDialog } from "./ConfirmDialog";
import { ItemBody } from "./ItemBody";

type ItemDetailProps = {
	item: BacklogItem;
	onReload: () => Promise<void>;
};

function DeleteAction({
	itemId,
	onDeleted,
}: {
	itemId: number;
	onDeleted: () => Promise<void>;
}) {
	const [confirming, setConfirming] = useState(false);
	return (
		<>
			{confirming && (
				<ConfirmDialog
					onConfirm={async () => {
						await deleteItem(itemId);
						await onDeleted();
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
	onDeleted,
}: {
	itemId: number;
	onDeleted: () => Promise<void>;
}) {
	const navigate = useNavigate();
	return (
		<div className="flex justify-between items-center mb-4">
			<BackButton to="/" />
			<div className="flex gap-2">
				<button
					type="button"
					className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md px-4 py-2 text-sm font-medium cursor-pointer"
					onClick={() => navigate(`/items/${itemId}/edit`)}
				>
					Edit
				</button>
				<DeleteAction itemId={itemId} onDeleted={onDeleted} />
			</div>
		</div>
	);
}

export function ItemDetail({ item, onReload }: ItemDetailProps) {
	const navigate = useNavigate();
	return (
		<>
			<DetailHeader
				itemId={item.id}
				onDeleted={async () => {
					await onReload();
					navigate("/");
				}}
			/>
			<ItemBody
				item={item}
				onStatusChange={async (status) => {
					await updateItemStatus(item.id, status);
					await onReload();
				}}
			/>
		</>
	);
}
