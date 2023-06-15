const prompt = "atmospheric, hazy, blurry, animation, weird, odd, off, post-impressionist, fauvism, detailed clothing, elementary shapes, abstract, expressionism, pop art";
const negativePrompt = "futuristic, highly detailed, stunningly beautiful, sharp focus, trending on instagram, trending on tumblr, HDR 4K, 8K'";

const generateAction = async (req, res) => {
  const { imgURL } = req.body;
  var raw = JSON.stringify({
    "key": process.env.STABLE_DIFFUSION_API_KEY,
    "prompt": prompt,
    "negative_prompt": negativePrompt,
    "init_image": imgURL,
    "width": "512",
    "height": "512",
    "samples": "4",
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
  console.log(resJSON)
  const { output } = resJSON;
  res.status(200).json({ images: output });
};

export default generateAction;
