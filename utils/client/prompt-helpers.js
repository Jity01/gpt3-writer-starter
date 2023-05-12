const getGeneration = async (conversation, apiEndPoint) => {
    const response = await fetch(`/api/prompt/${apiEndPoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation }),
    });
    const data = await response.json();
    const { output } = data;
    return output.text;
};

export const getConversationGeneration = async (conversation) => {
  const responseText = await getGeneration(conversation, 'generate-conversation');
  return responseText;
};

export const getFittingPrinciple = async (userInput) => {
  const responseText = await getGeneration(userInput, 'get-fitting-principle');
  return responseText;
};

export const getEmpathyGeneration = async (chatPrompt) => {
  const responseText = await getGeneration(chatPrompt, 'generate-empathy');
  return responseText;
};

const addCurrentLine = (chatContext, currentUserLine) => {
  const fullChatContext = `${chatContext}\nme: ${currentUserLine}\nyou: `;
  return fullChatContext;
};

const createChatContext = (previousChatLines) => {
  const chatContext = previousChatLines.reduce((acc, chatObject) => {
    return acc + `\nme: ${chatObject.user}\nyou: ${chatObject.JEN}`;
  }, '');
  return chatContext;
};

export const createFullChatContext = (previousChatLines, currentUserLine) => {
  const chatContext = createChatContext(previousChatLines, currentUserLine);
  const fullChatContextForPrompt = addCurrentLine(chatContext, currentUserLine);
  return fullChatContextForPrompt;
};

export const createSearchContext = (logs, userInput) => {
  let searchContext = logs.reduce((acc, log) => {
    if (!log.is_reply) return acc + `\n\nprinciple #${log.id}:\nprinciple message: "${log.message}"\n`;
  }, '');
  searchContext += `\n\nmy situation: "${userInput}"`;
  searchContext += `\n\nyour answer to the most fitting principle: `;
  return searchContext;
}