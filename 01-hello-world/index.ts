import "dotenv/config";
import { Agent, run } from "@openai/agents";

const agent = new Agent({
  name: "Assistant",
  instructions: "You are a helpful assistant",
  model: "gpt-4o-mini", // optional
});

const result = await run(
  agent,
  "How to initialize array in javascript? Answer in one line",
);

console.log(result.finalOutput);

console.log(result); // entire result

// --------------------------------------------------------------------

// You can also make the instructions dynamic

const location = "India";

const grettingAgent = new Agent({
  name: "Greeting Agent",
  instructions: () => {
    if (location === "India") {
      return `Always reply "Namaste"`;
    } else {
      return `"Always reply "Hello"`;
    }
  },
});

const greet = await run(grettingAgent, "Hello there");

console.log(greet.finalOutput);
