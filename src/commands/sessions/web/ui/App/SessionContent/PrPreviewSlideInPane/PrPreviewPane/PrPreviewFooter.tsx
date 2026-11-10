import { Divider } from "@mui/material";
import { PrCommentList } from "./PrPreviewFooter/PrCommentList";
import { PrPreviewFooterActions } from "./PrPreviewFooter/PrPreviewFooterActions";
import type { PrPreviewFooterProps } from "./PrPreviewFooterProps";
import { SelectionCommentPopover } from "../../../SelectionCommentPopover";

export function PrPreviewFooter(props: PrPreviewFooterProps) {
	const {
		comments,
		commentColors,
		pending,
		cwd,
		unavailable,
		onAdd,
		onQueue,
		onCite,
		onAddRule,
		onRemove,
		onCancel,
		onCollapse,
		editable,
	} = props;
	return (
		<>
			<PrCommentList
				comments={comments}
				colors={commentColors}
				onRemove={onRemove}
			/>
			<Divider />
			<PrPreviewFooterActions {...props} />
			<SelectionCommentPopover
				pending={pending}
				editable={editable}
				cwd={cwd}
				unavailable={unavailable}
				onAdd={onAdd}
				onQueue={onQueue}
				onCite={onCite}
				onAddRule={onAddRule}
				onCancel={onCancel}
				onCollapse={onCollapse}
			/>
		</>
	);
}
