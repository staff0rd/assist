import { typeIntoSessionHandler } from "./typeIntoSessionHandler";

export const handleTypePrompt = typeIntoSessionHandler(
	"type-prompt",
	(m, id, text) => m.io.typePrompt(id, text),
);
