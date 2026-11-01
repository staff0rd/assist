import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { DesignLink } from "./DesignLink";
import { PreviewMetadataList } from "./PreviewMetadataList";

export function PreviewLinks({ preview }: { preview: PrPreview }) {
	const designUrl =
		preview.kind === "design" ? preview.metadata?.[0]?.url : undefined;
	if (designUrl) return <DesignLink url={designUrl} />;
	return <PreviewMetadataList items={preview.metadata ?? []} />;
}
