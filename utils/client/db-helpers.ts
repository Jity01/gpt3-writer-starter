const baseURL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://reinfrc.com';

export const addLog = async (logMessage: string, userId: number, isReply: boolean, imgurl: string) => {
  const response = await fetch(`${baseURL}/api/db/add-log`, {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({ logMessage, userId, isReply, imgurl }),
  });
  const data = await response.json();
  await insertLogsIntoVectorDB(userId, data.lastLog);
  return data.lastLog[0].id;
};

export const deleteLog = async (userId: number, logId: number) => {
  await fetch(`${baseURL}/api/db/delete-log`, {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({ logId }),
  });
  await deleteLogVector(userId, logId.toString());
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
  const data = await response.json();
  return data;
};

export const queryFeedbackVectorDB = async (userId: number, inputV: Array<number>) => {
  const response = await fetch(`${baseURL}/api/db/query-feedback-vector`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, inputV }),
  });
  const data = await response.json();
  return data;
};

export const insertInputIntoFeedbackDB = async (
  userId: number,
  inputVector: Array<number>,
  outputEmbeddingsStrings: Array<string>
) => {
  await fetch(`${baseURL}/api/db/insert-vector-into-feedback-index`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      },
    body: JSON.stringify({ userId, inputVector, outputEmbeddingsStrings }),
  });
};

export const updateFeedbackInput = async (
  userId: number,
  id: string,
  outputEmbeddingsStrings: Array<string>
) => {
  await fetch(`${baseURL}/api/db/update-feedback-input`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
      body: JSON.stringify({ userId, id, outputEmbeddingsStrings }),
  });
};

export const insertLogsIntoVectorDB = async (userId, logs) => {
  await fetch(`${baseURL}/api/db/insert-logs-into-vector-db`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, logs }),
  });
};

export const deleteLogVector = async (userId, logId) => {
  await fetch(`${baseURL}/api/db/delete-log-vector`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, logId }),
  });
}

export const saveImg = async (userId: number, logId: number, imgURL: string) => {
  await fetch(`${baseURL}/api/db/save-img`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      },
    body: JSON.stringify({ userId, logId, imgURL }),
  });
}

export const addMusicLinkToLog = async (userId: number, logId: number, musicURL: string) => {
  await fetch(`${baseURL}/api/db/add-music-to-log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      },
    body: JSON.stringify({ userId, logId, musicURL }),
  });
}
