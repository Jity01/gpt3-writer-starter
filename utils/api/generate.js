import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const generate = async (promptPrefix, conversation) => {
  const baseCompletion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `${promptPrefix}${conversation}\n`,
    temperature: 0.8,
    max_tokens: 500,
  });
  const basePromptOutput = baseCompletion.data.choices.pop();
  return basePromptOutput;
};