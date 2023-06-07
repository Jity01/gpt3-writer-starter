export const getLinkFromCloudinary = async (url: string, dataURI) => {
  const response = await fetch('/api/cloudinary/get-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
      body: JSON.stringify({ url, dataURI }),
  });
  const output = await response.json();
  const { link } = output;
  return link;
};
