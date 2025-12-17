// The method 1 is good for viewing the result on the server side
// The method 2 is more useful for sending the json type data in chunks to the client side

import "dotenv/config";
import { Agent, run } from "@openai/agents";

const agent = new Agent({
  name: "Storyteller",
  instructions:
    "You are a storyteller. You will be given a topic and you will tell a story about it",
  model: "gpt-4o-mini",
});

// method 2
async function* streamOutput(query: string) {
  const result = await run(agent, query, {
    stream: true,
  });
  const stream = result.toTextStream();

  for await (const val of stream) {
    yield { isCompleted: false, value: val };
  }

  yield { isCompleted: true, value: result.finalOutput };
}

// method 1
// const main = async (query: string = "") => {
//   const result = await run(agent, query, {
//     stream: true,
//   });
//   result
//     .toTextStream({
//       compatibleWithNodeStreams: true,
//     })
//     .pipe(process.stdout);
// };

// method 2
const main = async (query: string = "") => {
  for await (const item of streamOutput(query)) {
    console.log(item);
  }
};

main("Tell me a story about a cat");
