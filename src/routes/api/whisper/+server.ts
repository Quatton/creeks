import { OPENAI_API_KEY } from "$env/static/private";
import type { CreekBlock, CreekSession } from "$lib/types/core.js";
import { json } from "@sveltejs/kit";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY
});

export async function POST({ request }) {
	const { session } = await request.json();

	console.time("transcriptions");
	const responses = await Promise.allSettled<string | null>(
		blocksToFiles(session).map(async ({ file, prompt }) => {
			const response = await openai.audio.transcriptions.create({
				file,
				model: "whisper-1",
				prompt
			});

			console.log(file.size);

			return response.text;
		})
	);
	console.timeEnd("transcriptions");

	console.time("post processing");

	const texts = responses.map((response) => {
		if (response.status === "fulfilled") {
			return response.value;
		} else {
			console.error(response.reason);
			return null;
		}
	});

	const blocks = session.blocks.map((block: CreekBlock) => {
		if (block.type === "audio") {
			const text = texts.shift();
			return {
				type: "text",
				createdAt: block.createdAt,
				content: text ? `> ${text}\n` : ``
			};
		} else {
			return block;
		}
	});

	console.timeEnd("post processing");

	return json({ blocks });
}

function blocksToFiles(session: CreekSession): {
	file: File;
	prompt: string;
}[] {
	const blocks = session.blocks
		.map((block: CreekBlock, i) => {
			if (block.type === "audio") {
				const file = new File(
					[Buffer.from(block.content.split(",")[1], "base64")],
					`x.webm`,
					{
						type: "audio/webm"
					}
				);
				return {
					file,
					prompt: `${session.title} ${
						session.blocks[i + 1].type === "text"
							? session.blocks[i + 1].content
							: ""
					}`
				};
			} else {
				return null;
			}
		})
		.filter((block) => block !== null);

	return blocks as { file: File; prompt: string }[];
}
