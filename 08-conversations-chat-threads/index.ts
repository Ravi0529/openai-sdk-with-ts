import "dotenv/config";
import { Agent, run, type AgentInputItem } from "@openai/agents";

let thread: AgentInputItem[] = [];

const agent = new Agent({
  name: "Assistant agent",
  instructions: "Help user solve their query",
  model: "gpt-4o-mini",
});

const main = async (query = "") => {
  const result = await run(
    agent,
    thread.concat({ role: "user", content: query }),
  );

  // carry over history + newly generated items
  thread = result.history; // required

  console.log("Result: ", result.finalOutput);
};

// main("Hi my name is Ravi");
// main("What is my name?");

main("Hi my name is Ravi").then(() => {
  main("What is my name?");
});
