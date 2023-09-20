import { OPENAI_API_KEY } from "$env/static/private";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { OpenAIApi, Configuration } from "openai-edge";

// IMPORTANT! Set the runtime to edge
export const config = {
	runtime: "edge"
};

const openaiConfig = new Configuration({
	apiKey: OPENAI_API_KEY
});

const openai = new OpenAIApi(openaiConfig);

const SYSTEM_PROMPT = `[CONTEXT]
You are a thought assistant bot. The user is trying to write a Mermaid flowchart, but an error occurs.
This is due to one or more of the following reasons:
1. You made an error during initial generation.
2. The user tried to combine two or more flowcharts together without proper tidying up.

[INSTRUCTIONS]
1. Combine all recklessly concatenated flowcharts into one.
2. Fix any errors in the flowchart.
3. Go back to the original markdown content and make sure that it includes all the necessary information.

[EXAMPLE PROMPT]

[ORIGINAL MARKDOWN CONTENT]
I made pasta today.
I also made a salad.
I made a smoothie too.

[ORIGINAL MERMAID FLOWCHART]
graph TD
  goal("Things I made today") -->|"Which is"| s1("Pasta")

graph TD
  goal("Delicious food I cook") -->|"Which is"| s1("Salad")

[EXAMPLE RESPONSE]
graph TD
  goal("Things I made today") -->|"Which is"| s1("Pasta")
  goal -->|"Which is"| s2("Salad")
  goal -->|"Which is"| s3("Smoothie")

[COMMENT]
Here o is for obstacle, a is for actionable item, and s is for success.
You can come up with your own node names, but please use the same node names for the same type of nodes.
Make sure you don't leave any edge blank.
As you can see, Smoothie was not included in the original flowchart, but it's in the original markdown content. 
You should also add it in the flowchart.

[MULTILINGUAL SUPPORT]
If the user input their text in a language other than English, please output the flowchart in the same language.
Except for the subgraph name. For the subgraph name, please output it in English.
For example, subgraph ภาษาไทย is disallowed
`.trim();

const USER_PROMPT = (prompt: string) =>
	`${prompt ? prompt : "(no prompt please return only empty string)"}
`.trim();

export async function POST({ request }) {
	const { prompt } = await request.json();

	const response = await openai.createChatCompletion({
		messages: [
			{
				role: "system",
				content: SYSTEM_PROMPT
			},
			{
				role: "user",
				content: USER_PROMPT(prompt)
			}
		],
		temperature: 0.2,
		model: "gpt-3.5-turbo-16k",
		stream: true
	});

	// Check for errors
	if (!response.ok) {
		return new Response(await response.text(), {
			status: response.status
		});
	}

	// Extract the text response from the Cohere stream
	const stream = OpenAIStream(response);
	// Respond with the stream
	return new StreamingTextResponse(stream);
}
