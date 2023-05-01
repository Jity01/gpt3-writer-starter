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
    const response = await fetch(`/api/get-user-id`,
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email }),
    });
    const data = await response.json();
    return data.userId;
};