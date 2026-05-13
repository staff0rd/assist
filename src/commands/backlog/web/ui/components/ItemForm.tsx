import { Paper } from "@mui/material";
import { useNavigate } from "react-router";
import { useRepoSelectionContext } from "../../../../sessions/web/ui/RepoSelectionProvider";
import type { BacklogItem } from "../types";
import { BackButton } from "./BackButton";
import { buildItemFormSubmit } from "./buildItemFormSubmit";
import { ItemFormFields } from "./ItemFormFields";
import { useItemFormState } from "./useItemFormState";

type ItemFormProps = {
	item?: BacklogItem;
	onReload: () => Promise<void>;
	backTo: string;
};

export function ItemForm({ item, onReload, backTo }: ItemFormProps) {
	const navigate = useNavigate();
	const { selectedCwd } = useRepoSelectionContext();
	const state = useItemFormState(item);

	const onSubmit = buildItemFormSubmit({
		type: state.type,
		name: state.name,
		description: state.description,
		criteria: state.acRef.current,
		item,
		cwd: selectedCwd || undefined,
		onSaved: async (id) => {
			await onReload();
			navigate(`/backlog/items/${id}`);
		},
	});

	return (
		<>
			<BackButton to={backTo} />
			<Paper
				component="form"
				variant="outlined"
				sx={{ p: 3 }}
				onSubmit={onSubmit}
			>
				<ItemFormFields
					title={state.defaults.title}
					submitLabel={state.defaults.submitLabel}
					type={state.type}
					onTypeChange={state.setType}
					name={state.name}
					onNameChange={state.setName}
					description={state.description}
					onDescriptionChange={state.setDescription}
					initialAc={state.defaults.ac}
					onAcChange={(v) => {
						state.acRef.current = v;
					}}
					onCancel={() => navigate(backTo)}
				/>
			</Paper>
		</>
	);
}
