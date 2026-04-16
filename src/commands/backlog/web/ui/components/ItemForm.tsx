import { Paper } from "@mui/material";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { BacklogItem } from "../types";
import { BackButton } from "./BackButton";
import { getDefaults, handleSubmit } from "./getDefaults";
import { ItemFormFields } from "./ItemFormFields";

type ItemFormProps = {
	item?: BacklogItem;
	onReload: () => Promise<void>;
	backTo: string;
};

export function ItemForm({ item, onReload, backTo }: ItemFormProps) {
	const navigate = useNavigate();
	const defaults = getDefaults(item);
	const [type, setType] = useState<"story" | "bug">(
		defaults.type as "story" | "bug",
	);
	const [name, setName] = useState(defaults.name);
	const [description, setDescription] = useState(defaults.description);
	const acRef = useRef<string[]>(defaults.ac);

	return (
		<>
			<BackButton to={backTo} />
			<Paper
				component="form"
				variant="outlined"
				sx={{ p: 3 }}
				onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
					handleSubmit(
						e,
						type,
						name,
						description,
						acRef.current,
						item,
						async (id) => {
							await onReload();
							navigate(`/backlog/items/${id}`);
						},
					)
				}
			>
				<ItemFormFields
					title={defaults.title}
					submitLabel={defaults.submitLabel}
					type={type}
					onTypeChange={setType}
					name={name}
					onNameChange={setName}
					description={description}
					onDescriptionChange={setDescription}
					initialAc={defaults.ac}
					onAcChange={(v) => {
						acRef.current = v;
					}}
					onCancel={() => navigate(backTo)}
				/>
			</Paper>
		</>
	);
}
