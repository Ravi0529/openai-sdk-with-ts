import "dotenv/config";
import { Agent, run, tool, webSearchTool } from "@openai/agents";
import { z } from "zod";
import nodemailer, { type SendMailOptions } from "nodemailer";

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
  tools: [webSearchTool(), sendEmailTool],
});

const main = async (query = "") => {
  const result = await run(agent, query);
  console.log("Result: ", result.finalOutput);
};

main(
  "Send the current weather of Surat to my friend Ravi on mistryravi051005@gmail.com",
);
