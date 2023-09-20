import mermaid from "mermaid";
import type { MermaidConfig, RenderResult } from "mermaid";

export const mermaidRender = async (
	config: MermaidConfig,
	code: string,
	id: string
): Promise<RenderResult> => {
	// Should be able to call this multiple times without any issues.
	mermaid.initialize(config);
	return await mermaid.render(id, code);
};

export const mermaidParse = async (code: string): Promise<boolean> => {
	return (
		(await mermaid.parse(code, {
			suppressErrors: true
		})) ?? false
	);
};

export const updateMermaidNode = (
	code: string,
	update: {
		id: string;
		label: string;
	}
) => {
	// it's in the form of
	// nodeId("label")
	// 1. we find that nodeId
	// 2. we replace the label
	// 3. profit
	const nodeId = update.id;
	const label = update.label;
	const regex = new RegExp(`${nodeId}\\(.*\\)`, "gm");
	const newCode = code.replace(
		regex,
		`${nodeId}("${label.replace(/"/g, '\\"')}")`
	);
	return newCode;
};

export const nodeIdExists = (code: string, id: string) => {
	const regex = new RegExp(`${id}\\(".*"\\)`);
	return regex.test(code);
};

export const generateNodeId = (code: string): string => {
	const number = Math.floor(Math.random() * 10000);
	const id = `node${number}`;

	if (nodeIdExists(code, id)) {
		return generateNodeId(code);
	}

	return id;
};

export const addNewNode = (code: string, fromId: string): string => {
	if (!nodeIdExists(code, fromId)) {
		throw new Error("Node does not exist");
	}
	const id = generateNodeId(code);
	const newCode = `${code}\n\t${fromId} --> ${id}("...")`;
	return newCode;
};
