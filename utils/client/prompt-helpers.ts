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

export const generateImg = async (imgURL: string, prompt: string) => {
  const response = await fetch('/api/generate/generate-img', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imgURL, prompt }),
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
  "i am writing in my journal. only ask me questions based on what i write to help me develop my ideas further. ask one question at a time. look also for why i felt the need to write that and what the context behind it was/what i experienced to make me write that. make sure all of your letters are lowercased. be informal (cuz we're texting). use emojis with your questions! and make sure your questions are very short and succinct. be enthusiastic! make sure you only use lowercase letters (cuz we're texting).";
  const chatContext = basePrompt + "\n\n" + cleanInput(userInput) + "\n\n";
  return chatContext;
};

export const createTalkToMePrompt = (chosenValue: string, userInput: string) => {
  const basePrompt =
`read this journal entry: "${chosenValue}"

i am the author. and you are a random friend off of my phone. when i text you what i am currently facing, ask me simple questions and convince me to adopt the mindset of my journal entry. only ask one question at a time so as not to confuse me. ask really quirky question. as you ask question, give me snippets of my journal entry as advice. re-use and quote the journal entry's words as you write your answers. make sure you are very very short and succinct. be really enthusiastic, informal (cuz we're texting) and funny and help me answer the questions you ask me. make sure all of your letters are lowercased. make sure your sentences and your quotes blend into each other and make sense logically when put together. use emoji but only here and there in our conversation! make sure each one of your letters are lowercased (cuz we're texting!).

NOTE: only do the "you" part of the conversation. and only do one line. let me lead the conversation. respect the rate of the conversation. if i say "hi!" just say "hi!" back like a normal person. only after do you start to talk.

---
the conversation:
---
`;
  const chatContext = basePrompt + "\n" + cleanInput(userInput) + "\n";
  return chatContext;
}
