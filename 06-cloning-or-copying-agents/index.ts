// need a slightly modified version of an existing agent? Use the clone() method, which returns an entirely new Agent instance

import "dotenv/config";
import { Agent, run } from "@openai/agents";

const MODEL = "gpt-4o-mini";

const pirateAgent = new Agent({
  name: "Pirate",
  instructions: "Respond like a pirate – lots of 'Arrr!'",
  model: MODEL,
});

// cloning
const robotAgent = pirateAgent.clone({
  name: "Robot",
  instructions: "Respond like a robot - be precise and factual",
});

const main = async (query = "") => {
  const result = await run(pirateAgent, query);
  // const result = await run(robotAgent, query)
  console.log("Result: ", result.finalOutput);
};
