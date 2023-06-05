const generateAction = async (req, res) => {
  const { prompt, imgURL } = req.body;
  var raw = JSON.stringify({
    "key": process.env.STABLE_DIFFUSION_API_KEY,
    "prompt": prompt,
    "negative_prompt": null,
    "init_image": imgURL,
    "width": "512",
    "height": "512",
    "samples": "1",
    "num_inference_steps": "30",
    "safety_checker": "no",
    "enhance_prompt": "yes",
    "guidance_scale": 7.5,
    "strength": 0.6,
    "seed": null,
    "webhook": null,
    "track_id": null
  });
  const response = await fetch("https://stablediffusionapi.com/api/v3/img2img", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: raw,
    redirect: 'follow'
  });
  const resJSON = await response.json();
  console.log(resJSON);
  const { output } = resJSON;
  res.status(200).json({ images: output });
};

export default generateAction;
