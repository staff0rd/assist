import { DiffViewBody, type DiffViewBodyProps } from "./DiffViewBody";
import { PageSpinner } from "../PageSpinner";

export function DiffContentBody({
	loading,
	...body
}: DiffViewBodyProps & { loading: boolean }) {
	if (loading) return <PageSpinner />;

	return <DiffViewBody {...body} />;
}
