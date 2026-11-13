export function stepperButton(doc: Document, label: string, text: string) {
	const element = doc.createElement("button");
	element.type = "button";
	element.ariaLabel = label;
	element.title = label;
	element.textContent = text;
	return element;
}
