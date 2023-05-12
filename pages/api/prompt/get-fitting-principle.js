import { generate } from '../../../utils/api/generate';
import { initialPrinciplePrompt } from '../../../utils/constants/prompts';

const generateAction = async (req, res) => {
  const basePromptOutput = await generate(initialPrinciplePrompt, req.body.conversation);
  res.status(200).json({ output: basePromptOutput });
}

export default generateAction;
