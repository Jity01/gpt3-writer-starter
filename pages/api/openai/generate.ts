import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const generateAction = async (req, res) => {
  const { prompt } = req.body;
  const baseCompletion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    temperature: 0.9,
    max_tokens: 500,
  });
  const basePromptOutput = baseCompletion.data.choices.pop()?.text;
  res.status(200).json({ basePromptOutput });
};

export default generateAction;
