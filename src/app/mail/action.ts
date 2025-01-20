"use server";

import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";

export async function generateEmail(context: string, prompt: string) {
  const stream = createStreamableValue();

  (async () => {
    const { textStream } = streamText({
      model: openai("gpt-4o-mini"),
      prompt: `
        You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by providing suggestions and relevant information based on the context of their previous emails.

        THE TIME IS NOW ${new Date().toLocaleString()}

        START CONTEXT BLOCK
        ${context}
        END OF CONTEXT BLOCK

        USER PROMPT:
        ${prompt}

        When responding, please keep in mind:
        - Be helpful, clever, and articulate.
        - Reply on the provided email context to inform your response.
        - If the context does not contain enough information to fully address the prompt, politely give a draft response.
        - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
        - Do not invent or speculate about anything that is not directly supported by the email context.
        - Keep your response focused and relevant to the users's prompt.
        - Don't add fluff like 'Heres your email' or 'Here's your email' or anything like that.
        - Directly output the email, no need to say 'Here is your email' or anything like that.
        - No need to output subject.
      `,
    });

    for await (const token of textStream) {
      stream.update(token);
    }

    stream.done();
  })();

  return { output: stream.value };
}

export async function generate(input: string) {
  const stream = createStreamableValue();

  (async () => {
    const { textStream } = streamText({
      model: openai("gpt-4o-mini"),
      prompt: `
        ALWAYS RESPOND IN PLAIN TEXT, no html or markdown.
        You are a helpful AI embedded in an email client that is used to autocomplete sentences, similat to google gmail autocomplete.
        The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
        AI is a well-behaved and well-mannered individual.
        AI is always friendly, kind, inspiring, and is eager to provide vivid and thoughtful responses to the user.
        I am writing a reply to an email.
        Help me complete my response here: <input>${input}</input>
        Keep the tone of the text consistent with the rest of the text.
        Keep the response short and sweet. Act like a copilot, finish my sentence if need be, but don't try to generate a whole new paragraph.
        Do not add fluff like "I'm here to help you" or "I'a helpful AI" or anything like that.

        Example:
        Dear Alice, I'm sorry to hear that you are feeling down.

        Output: Unfortunately, I can't help you with that.

        Your output is directly concatenated to the input, so do not add new lines or formatting, just plain text.
      `,
    });

    for await (const token of textStream) {
      stream.update(token);
    }

    stream.done();
  })();

  return { output: stream.value };
}
