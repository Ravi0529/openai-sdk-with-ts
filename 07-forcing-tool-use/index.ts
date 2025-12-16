import { Agent, tool } from "@openai/agents";
import { z } from "zod";

const calculatorTool = tool({
  name: "Calculator",
  description: "Use this tool to answer questions about math problems.",
  parameters: z.object({
    question: z.string(),
  }),
  execute: async (input) => {
    throw new Error("TODO: implement this");
  },
});

const agent = new Agent({
  name: "Strict tool user",
  instructions: "Always answer using the calculator tool.",
  tools: [calculatorTool],

  // "auto", "required", "none"
  modelSettings: { toolChoice: "required" }, // it is on "auto" by default
});
