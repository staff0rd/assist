import { MarkdownBlock } from "../../../../../../../backlog/web/ui/components/MarkdownBlock";
import { FileCommentLayer } from "../../../FileCommentLayer";
import { MonacoEditor } from "./FileViewBody/MonacoEditor";
import { monacoLanguageForPath } from "./FileViewBody/monacoLanguageForPath";
import type { FileComments } from "./useFileComments";

const EDITOR_HEIGHT = "calc(100vh - 152px)";

export function FileViewBody({
	path,
	cwd,
	rendered,
	value,
	onChange,
	comments,
}: {
	path: string;
	cwd: string;
	rendered: boolean;
	value: string;
	onChange: (value: string) => void;
	comments: FileComments;
}) {
	if (rendered)
		return (
			<FileCommentLayer
				path={path}
				cwd={cwd}
				source={value}
				onComment={comments.onComment}
				onAddRule={comments.onAddRule}
				unavailable={comments.unavailable}
			>
				<MarkdownBlock content={value} renderMermaid wide />
			</FileCommentLayer>
		);

	return (
		<MonacoEditor
			value={value}
			language={monacoLanguageForPath(path)}
			height={EDITOR_HEIGHT}
			onChange={onChange}
		/>
	);
}
