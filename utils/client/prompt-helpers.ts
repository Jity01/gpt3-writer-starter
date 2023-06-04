export const getGeneration = async (prompt: string) => {
  const response = await fetch(`/api/openai/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });
  const output = await response.json();
  const { basePromptOutput } = output;
  return basePromptOutput;
};

const cleanInput = (input: string) => {
  const cleanedInput = input.replace(/<strong>/g, "").replace(/<\/strong>/g, "").replace(/\*/g, "");
  return cleanedInput;
};

export const createPromptContext = (userInput: string) => {
  const basePrompt =
  "I am writing in my journal. Only ask me questions based on what I write to help me develop my ideas further. Ask one question at a time. Look also for why I felt the need to write that.";
  const chatContext = basePrompt + "\n\n" + cleanInput(userInput) + "\n\n";
  return chatContext;
};

export const createTalkToMePrompt = (chosenValue: string, userInput: string) => {
  const basePrompt =
  `read this journal entry: "${chosenValue}"
  
  you are the author. when i tell you what i am currently facing, ask me a lot of simple, direct questions to develop my ideas further. ONLY ASK ME ONE QUESTION AT A TIME. and then, after you've gotten me to really talk about my ideas, encourage me to do the points in your statement, re-using and quoting the document's words as you write your answers. convince me to adopt your mindset. make sure you are short and succinct.
  
  NOTE: listen to me and wait for me. do not - i repeat - DO NOT finish the conversation by yourself.`;
  const chatContext = basePrompt + "\n\n" + cleanInput(userInput) + "\n\n";
  return chatContext;
}