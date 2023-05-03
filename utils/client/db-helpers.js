// TODO: fix undefined urls (v volatile)
const baseURL = process.env.NODE_ENV === 'production' ? process.env.PROD_BASEURL : process.env.DEV_BASEURL;

export const addLog = async (logMessage, userId) => {
  await fetch(`/api/db/add-log`, {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({ logMessage, userId }),
  });
};

export const addUser = async (firstName, lastName, email) => {
  await fetch(`/api/db/add-user`, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    },
    body: JSON.stringify({ firstName, lastName, email }),
  });
};

export const getUserId = async (firstName, lastName, email) => {
  console.log(`${baseURL}/api/db/get-user-id`);
    const response = await fetch(`/api/db/get-user-id`,
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
  const response = await fetch(`/api/db/get-logs`,
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
  await fetch(`/api/db/delete-log`, {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({ logId }),
  });
};