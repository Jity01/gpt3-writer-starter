const getLink = async (req, res) => {
  const { url, dataURI } = req.body;
  const fd = new FormData();
  fd.append("file", dataURI);
  fd.append("cloud_name", process.env.CLOUDINARY_NAME || "");
  fd.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET || "");
  console.log('fd', fd)
  const response = await fetch(url, {
    method: 'POST',
    body: fd,
  });
  const resJSON = await response.json();
  res.status(200).json({ link: resJSON.secure_url });
};

export default getLink;
