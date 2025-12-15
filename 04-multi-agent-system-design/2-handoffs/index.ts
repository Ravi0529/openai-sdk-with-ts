// View the traces on --> https://platform.openai.com/logs?api=traces

import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";
import { z } from "zod";
import fs from "node:fs/promises";

const MODEL = "gpt-4o-mini";

const fetchAvailablePlans = tool({
  name: "fetch_available_plans",
  description: "Fetches the available plans for internet",
  parameters: z.object({}),
  async execute() {
    return [
      { plan_id: "1", price_inr: 399, speed: "30MB/s" },
      { plan_id: "2", price_inr: 999, speed: "100MB/s" },
      { plan_id: "3", price_inr: 1499, speed: "200MB/s" },
    ];
  },
});

const processRefund = tool({
  name: "process_refund",
  description: `This tool processes the refund for a customer`,
  parameters: z.object({
    customerId: z.string().describe("id of the customer"),
    reason: z.string().describe("reason for refund"),
  }),
  async execute({ customerId, reason }) {
    await fs.appendFile(
      "./04-multi-agent-system-design/2-handoffs/refund.txt",
      `Refund for Customer having ID ${customerId} for ${reason}`,
      "utf-8",
    );
    return { refundIssued: true };
  },
});

const salesAgent = new Agent({
  name: "Sales expert",
  instructions: "Handles explaining available plans as sales team",
  model: MODEL,
  tools: [fetchAvailablePlans],
});

const refundAgent = new Agent({
  name: "Refund expert",
  instructions: "Handles refund questions and requests",
  model: MODEL,
  tools: [processRefund],
});

const receptionAgent = new Agent({
  name: "Reception agent",
  instructions: `
  ${RECOMMENDED_PROMPT_PREFIX}
  You are the customer facing agent expert in understanding what customer needs and then route them or handoff them to the right agent`,
  handoffDescription: `You have two agents available:
    - salesAgent: Expert in handling queries like all plans and pricing available. Good for new customers
    - refundAgent: Expert in handling user queries for existing customers and issue refunds and help them
  `,
  model: MODEL,
  handoffs: [salesAgent, refundAgent],
});

const main = async (query = "") => {
  const result = await run(receptionAgent, query);
  console.log("Result: ", result.finalOutput);
  console.log("History: ", result.history);
};

main(
  "I had a plan of 399. I need a refund right now because of I am shifting to a new place, my customerId is custId123",
);
