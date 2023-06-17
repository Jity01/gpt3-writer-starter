export const getGeneration = async (prompt: string) => {
  const response = await fetch(`/api/generate/generate`, {
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

export const generateImg = async (imgURL: string) => {
  const response = await fetch('/api/generate/generate-img', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imgURL }),
  });
  const output = await response.json();
  const { images } = output;
  return images;
};

const cleanInput = (input: string) => {
  const cleanedInput = input.replace(/<strong>/g, "").replace(/<\/strong>/g, "").replace(/\*/g, "");
  return cleanedInput;
};

export const createPromptContext = (userInput: string) => {
  const basePrompt =
  "i am writing in my journal. only ask me questions based on what i write to help me develop my ideas further. ask one question at a time. look also for why i felt the need to write that and what the context behind it was/what i experienced to make me write that. make sure all of your letters are lowercased. be informal (cuz we're texting). use emojis with your questions! and make sure your questions are short and succinct. be enthusiastic! make sure you only use lowercase letters (cuz we're texting).";
  const chatContext = basePrompt + "\n\n" + cleanInput(userInput) + "\n\n";
  return chatContext;
};

export const createTalkToMePrompt = (chosenValue: string, userInput: string) => {
  const basePrompt =
`Read this journal entry: "${chosenValue}"

I am the author. And you are a random friend off of my phone. When I text you what I am currently facing, ask me simple questions and convince me to adopt the mindset of my journal entry. only ask one question at a time so as not to confuse me. ask really quirky question. as you ask question, give me snippets of my journal entry as advice. re-use and quote the journal entry's words as you write your answers. make sure you are short and succinct. be really enthusiastic, informal (cuz we're texting) and funny and help me answer the questions you ask me. make sure all of your letters are lowercased. make sure your sentences and your quotes blend into each other and make sense logically when put together. use emoji but only here and there in our conversation!

NOTE: listen to me and wait for me. do not - I repeat - DO NOT finish the conversation by yourself.

---
Our conversation:
---
`;
  const chatContext = basePrompt + "\n" + cleanInput(userInput) + "\n";
  return chatContext;
}
