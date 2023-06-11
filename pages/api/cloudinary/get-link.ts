const getLink = async (req, res) => {
  const { url, dataURI } = req.body;
  const fd = new URLSearchParams();
  fd.append("file", dataURI);
  fd.append("cloud_name", process.env.CLOUDINARY_NAME || "");
  fd.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET || "");
  const response = await fetch(url, {
    method: 'POST',
    body: fd,
  });
  const resJSON = await response.json();
  res.status(200).json({ link: resJSON.secure_url });
};

export default getLink;
