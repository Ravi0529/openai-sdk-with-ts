import "dotenv/config";
import { Agent, run, tool, webSearchTool } from "@openai/agents";
import { z } from "zod";
import nodemailer, { type SendMailOptions } from "nodemailer";
import readline from "node:readline/promises";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER,
    pass: process.env.APP_PASSWORD,
  },
});

const sendEmailTool = tool({
  name: "send_email",
  description: "This tool sends an email",
  parameters: z.object({
    toEmail: z.string().describe("Email address to"),
    subject: z.string().describe("Subject"),
    body: z.string().describe("Body of the email"),
  }),

  // need human approval before calling this particular tool
  needsApproval: true,
  async execute({ toEmail, subject, body }) {
    const mailOption: SendMailOptions = {
      from: {
        name: "Weather Bot",
        address: process.env.USER!,
      },
      to: toEmail,
      subject,
      text: body,
    };

    try {
      await transporter.sendMail(mailOption);
      return `Weather email sent successfully to ${toEmail}`;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to send Email");
    }
  },
});

const agent = new Agent({
  name: "Weather Agent",
  instructions: `
    You are an AI assistant.

    Steps you MUST follow:
    1. Use webSearchTool to get the current weather of the requested city.
    2. Summarize the weather in a friendly human-readable format.
    3. Create a suitable email subject.
    4. Send the weather details via email to the mentioned email address using send_email tool.

    DO NOT explain steps.
    ONLY perform actions and send email.
  `,
  model: "gpt-4o-mini",
  tools: [webSearchTool(), sendEmailTool],
});

const askForUserConfirmation = async (ques: string) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await rl.question(`${ques} (y/n): `);
  const normalizedAnswer = answer.toLowerCase();
  rl.close();
  return normalizedAnswer === "y" || normalizedAnswer === "yes";
};

const main = async (query = "") => {
  let result = await run(agent, query);
  let hasInterruptions = result.interruptions.length > 0;
  while (hasInterruptions) {
    const currentState = result.state;
    for (const interrupt of result.interruptions) {
      if (interrupt.type === "tool_approval_item") {
        const isAllowed = await askForUserConfirmation(
          `Agent ${interrupt.agent.name} is asking for calling tool ${interrupt.name} with args ${interrupt.arguments}`,
        );

        if (isAllowed) {
          currentState.approve(interrupt);
        } else {
          currentState.reject(interrupt);
        }

        result = await run(agent, currentState);
        hasInterruptions = result.interruptions.length > 0;
      }
    }
  }
};

main(
  "Send the current weather of Surat to my friend Ravi on mistryravi051005@gmail.com",
);
