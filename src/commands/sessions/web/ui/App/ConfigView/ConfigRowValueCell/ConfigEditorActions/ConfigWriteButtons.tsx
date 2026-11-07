import Button from "@mui/material/Button";
import { ConfirmDialog } from "../../../../../../../backlog/web/ui/components/ConfirmDialog";
import { useShiftSkipConfirm } from "../../../../useShiftSkipConfirm";

type Props = {
	saving: boolean;
	canClear?: boolean;
	clearTitle?: string;
	onSave: () => void;
	onClear?: () => void;
	onCancel: () => void;
};

export function ConfigWriteButtons({
	saving,
	canClear,
	clearTitle,
	onSave,
	onClear,
	onCancel,
}: Props) {
	const { confirming, close, triggerHandlers, withHint } = useShiftSkipConfirm(
		() => onClear?.(),
	);
	return (
		<>
			<Button
				size="small"
				variant="contained"
				disabled={saving}
				onClick={onSave}
			>
				Save
			</Button>
			<Button size="small" disabled={saving} onClick={onCancel}>
				Cancel
			</Button>
			{canClear && onClear && (
				<Button
					size="small"
					color="error"
					disabled={saving}
					title={withHint(clearTitle ?? "Remove this setting")}
					{...triggerHandlers}
				>
					Clear
				</Button>
			)}
			{confirming && onClear && (
				<ConfirmDialog
					title="Clear setting"
					message={`${clearTitle ?? "Remove this setting"}?`}
					confirmLabel="Clear"
					onConfirm={() => {
						close();
						onClear();
					}}
					onCancel={close}
				/>
			)}
		</>
	);
}
