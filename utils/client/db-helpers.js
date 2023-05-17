// TODO: fix undefined urls (v volatile)
// const baseURL = process.env.NODE_ENV === 'production' ? process.env.PROD_BASEURL : process.env.DEV_BASEURL;
const baseURL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://reinfrc.com'

export const addLog = async (logMessage, userId, isReply) => {
  const response = await fetch(`${baseURL}/api/db/add-log`, {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({ logMessage, userId, isReply }),
  });
  const data = await response.json();
  const { lastLogId } = data;
  return lastLogId;
};

export const addReplyToLog = async (logId, replyLogId) => {
  await fetch(`${baseURL}/api/db/add-reply-to-log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ logId, replyLogId }),
  });
};

export const addUser = async (firstName, lastName, email) => {
  await fetch(`${baseURL}/api/db/add-user`, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    },
    body: JSON.stringify({ firstName, lastName, email }),
  });
};

export const getUserId = async (firstName, lastName, email) => {
  const response = await fetch(`${baseURL}/api/db/get-user-id`,
  {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firstName, lastName, email }),
  });
  const data = await response.json();
  const { userId } = data;
  return userId;
};

export const getLogsByUserId = async (userId) => {
  const response = await fetch(`${baseURL}/api/db/get-logs`,
  {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
  });
  const data = await response.json();
  const { logs } = data;
  return logs;
};

export const deleteLog = async (logId) => {
  await fetch(`${baseURL}/api/db/delete-log`, {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({ logId }),
  });
};

export const resetReplyLogId = async (logId) => {
  await fetch(`${baseURL}/api/db/reset-reply-log-id`, {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({ logId }),
  });
};

export const queryVectorDB = async (userId, userInput) => {
  const response = await fetch(`${baseURL}/api/db/query-vector-db`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, userInput }),
  });
  const matches = await response.json();
  const { scoredVectors } = matches;
  return scoredVectors;
};

export const addWin = async (logId, updatedWins) => {
  await fetch(`${baseURL}/api/db/add-win`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify({ logId, updatedWins }),
  });
};
