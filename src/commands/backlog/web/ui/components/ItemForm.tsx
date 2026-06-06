import { Paper } from "@mui/material";
import { useNavigate } from "react-router";
import type { BacklogItem } from "../types";
import { useRepoCwd } from "../useRepoCwd";
import { BackButton } from "./BackButton";
import { handleSubmit } from "./getDefaults";
import { ItemFormFields } from "./ItemFormFields";
import { useItemFormState } from "./useItemFormState";

type ItemFormProps = {
	item?: BacklogItem;
	onReload: () => Promise<void>;
	backTo: string;
};

export function ItemForm({ item, onReload, backTo }: ItemFormProps) {
	const navigate = useNavigate();
	const cwd = useRepoCwd();
	const form = useItemFormState(item);

	return (
		<>
			<BackButton to={backTo} />
			<Paper
				component="form"
				variant="outlined"
				sx={{ p: 3 }}
				onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
					handleSubmit(e, form.fields(), item, cwd, async (id) => {
						await onReload();
						navigate(`/backlog/items/${id}`);
					})
				}
			>
				<ItemFormFields
					title={form.defaults.title}
					submitLabel={form.defaults.submitLabel}
					type={form.type}
					onTypeChange={form.setType}
					name={form.name}
					onNameChange={form.setName}
					description={form.description}
					onDescriptionChange={form.setDescription}
					initialAc={form.defaults.ac}
					onAcChange={form.setAc}
					onCancel={() => navigate(backTo)}
				/>
			</Paper>
		</>
	);
}
