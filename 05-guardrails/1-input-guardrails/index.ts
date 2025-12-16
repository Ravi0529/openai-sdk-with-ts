// Tripwires
// When a guardrail fails, it signals this via a tripwire. As soon as tripwire is triggeredm the runner throws the corresponding error and halts execution

import "dotenv/config";
import {
  Agent,
  run,
  InputGuardrailTripwireTriggered,
  type InputGuardrail,
} from "@openai/agents";
import { z } from "zod";

const MODEL = "gpt-4o-mini";

const guardrailAgent = new Agent({
  name: "Guardrail check",
  instructions: "Check if the user is asking you to do their math homework",
  model: MODEL,
  outputType: z.object({
    isMathHomework: z.boolean(),
    reasoning: z.string().optional(),
  }),
});

const mathGuardrail: InputGuardrail = {
  name: "Math Homework Guardrail",
  // set runInParallel to false to block the model until the guardrail completes
  runInParallel: false,
  execute: async ({ input }) => {
    const result = await run(guardrailAgent, input);
    return {
      outputInfo: result.finalOutput?.reasoning,
      tripwireTriggered: result.finalOutput?.isMathHomework ?? false,
    };
  },
};

const agent = new Agent({
  name: "Customer support agent",
  instructions:
    "You are a customer support agent. You help customers with their questions.",
  model: MODEL,
  inputGuardrails: [mathGuardrail],
});

const main = async (query = "") => {
  try {
    const result = await run(agent, query);
    console.log("Result: ", result.finalOutput);
  } catch (error) {
    if (error instanceof InputGuardrailTripwireTriggered) {
      console.log(`Rejected because: ${error.message}`);
    }
  }
};

// Here if you give the agent Maths Homework, then it will not help you
main("explain const in js");
// main("Can you help me solve for x: 2x + 3 = 11");
