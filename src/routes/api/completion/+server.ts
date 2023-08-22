import { COHERE_API_KEY } from "$env/static/private";
import { StreamingTextResponse, CohereStream } from "ai";

// IMPORTANT! Set the runtime to edge
export const config = {
	runtime: "edge"
};

const PROMPT = (prompt: string) =>
	`[ORIGINAL TEXT]
${prompt ? prompt : "(no prompt please return only empty string)"}
	
[INSTRUCTIONS]
1. Write a response in markdown format, and nothing else other than the response.
2. Fix any grammar and spelling mistakes.
3. Remove redundant information.
4. Do not add any new information.
5. Make bullet point and action items. Summarize the response as needed.
`.trim();

export async function POST({ request }) {
	const { prompt } = await request.json();

	const body = JSON.stringify({
		prompt: PROMPT(prompt),
		model: "command-nightly",
		max_tokens: 2048,
		stop_sequences: [],
		temperature: 0.1,
		stream: true
	});

	const response = await fetch("https://api.cohere.ai/v1/generate", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${COHERE_API_KEY}`
		},
		body
	});

	// Check for errors
	if (!response.ok) {
		return new Response(await response.text(), {
			status: response.status
		});
	}

	// Extract the text response from the Cohere stream
	const stream = CohereStream(response);
	// Respond with the stream
	return new StreamingTextResponse(stream);
}
