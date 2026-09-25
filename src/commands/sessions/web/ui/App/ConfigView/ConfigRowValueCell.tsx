import TableCell from "@mui/material/TableCell";
import type { ConfigObjectListNode } from "../../../../../../shared/ConfigNode";
import type { ConfigEntry } from "../../../../../config/readConfigEntries";
import { ConfigArrayRow } from "./ConfigRowValueCell/ConfigArrayRow";
import { ConfigRowEditor } from "./ConfigRowValueCell/ConfigRowEditor";
import { ConfigValue } from "./ConfigRowValueCell/ConfigValue";

type Props = {
	entry: ConfigEntry;
	list: ConfigObjectListNode | undefined;
	editing: boolean;
	cwd: string;
	onSaved: () => void;
	onError: (message: string) => void;
	onCancel: () => void;
};

export function ConfigRowValueCell({
	entry,
	list,
	editing,
	cwd,
	onSaved,
	onError,
	onCancel,
}: Props) {
	return (
		<TableCell sx={{ verticalAlign: "top" }}>
			{list ? (
				<ConfigArrayRow
					entry={entry}
					node={list}
					cwd={cwd}
					onSaved={onSaved}
					onError={onError}
				/>
			) : editing ? (
				<ConfigRowEditor
					entry={entry}
					cwd={cwd}
					onError={onError}
					onCancel={onCancel}
					onSaved={onSaved}
				/>
			) : (
				<ConfigValue entry={entry} />
			)}
		</TableCell>
	);
}
