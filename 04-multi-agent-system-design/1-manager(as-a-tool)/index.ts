// View the traces on --> https://platform.openai.com/logs?api=traces

import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
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
      "./04-multi-agent-system-design/1-manager(as-a-tool)/refund.txt",
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

const customerFacingAgent = new Agent({
  name: "Customer-facing agent",
  instructions:
    "Talk to the user directly. When they need refund or want to know about the available plans from the sales team, call the matching tool",
  model: MODEL,
  tools: [
    salesAgent.asTool({
      toolName: "sales_expert",
      toolDescription: "Handles explaining available plans as sales team",
    }),
    refundAgent.asTool({
      toolName: "refund_expert",
      toolDescription: "Handles refund questions and requests",
    }),
  ],
});

const main = async (query = "") => {
  const result = await run(customerFacingAgent, query);
  console.log("Result: ", result.finalOutput);
};

main(
  "I had a plan of 399. I need a refund right now because of I am shifting to a new place, my customerId is custId123",
);
