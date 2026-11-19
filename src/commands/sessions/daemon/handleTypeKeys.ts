import { typeIntoSessionHandler } from "./typeIntoSessionHandler";

export const handleTypeKeys = typeIntoSessionHandler(
	"type-keys",
	(m, id, keys) => m.io.typeKeys(id, keys),
);
