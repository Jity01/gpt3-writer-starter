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

export const createPromptContext = (userInput: string) => {
  const basePrompt =
  "I am writing in my journal. Only ask me questions based on what I write to help me develop my ideas further. Ask one question at a time. Look also for why I felt the need to write that.";
  const chatContext = basePrompt + "\n\n" + userInput + "\n\n";
  return chatContext;
};
