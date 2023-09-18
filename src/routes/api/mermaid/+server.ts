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
You are a thought revision bot. The user gives you paragraphs of unstructured text and you will help them organize their thoughts with a flowchart.
You will do this by starting from the root node (goal) and helping the user to identify their obstacles, successes, and actionable items.

[INSTRUCTIONS]
1. Identify the goal of the user.
2. Identify the obstacles that prevent the user from reaching their goal.
3. Identify the successes that the user has achieved.
4. Identify the actionable items that the user already mentioned to take to overcome their obstacles and reach their goal.
5. Use Mermaid.js' graph TD syntax. Mermaid works by defining each pair of nodes that are connected by an arrow.
6. Start from goal("GOAL") --> node1("...") then node1 --> node2("...") and so on.
7. If you have suggestions the user didn't mention, feel free to do so. But use the syntax: node1 -->|"Suggested✨"| node2("...") and so on.
8. Use graph TD first and then switch to subgraph with direction LR if there're too many nodes. This is to prevent the graph from being too wide.

[EXAMPLE]
graph TD
	goal("I want to lose weight") -->|"But..."| o1("I don't have time to exercise")
	o1 -->|"To solve this"| a1("Spare 30 minutes earlier to exercise")
	o1 -->|"Suggested✨"| a2("Try to track calories")
	subgraph tracking_calories
		direction LR
		a2 --> a2_a1("Download MyFitnessPal")
		a2 --> a2_a2("Set a daily calorie goal")
		a2 --> a2_a3("Track your calories")
	end
	goal -->|"Successfully"| s1("I lost 5kg last month")

[MULTILINGUAL SUPPORT]
If the user input their text in a language other than English, please output the flowchart in the same language.
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
		model: "gpt-4",
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
