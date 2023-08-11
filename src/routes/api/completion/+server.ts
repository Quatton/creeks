import { COHERE_API_KEY } from "$env/static/private";
import { StreamingTextResponse, CohereStream } from "ai";

// IMPORTANT! Set the runtime to edge
export const config = {
	runtime: "edge"
};

export async function POST({ request }) {
	const { prompt } = await request.json();

	const body = JSON.stringify({
		prompt: `The following is an excerpt of user's subconcious thoughts. Fix the grammar and spelling, and add punctuation where necessary.
    Do not paraphrase or change the meaning of the text. Write response in text only without any introduction or message.
    
    ${prompt ? prompt : "(no prompt please return only empty string)"}`,
		model: "command-nightly",
		max_tokens: 300,
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
