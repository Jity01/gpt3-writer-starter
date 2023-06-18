const promptPrefix = "pop art, cartoon-ish, Richard William Hamilton, André Derain, fauvism, Jean Metzinger, James Albert Rosenquist, Andy Warhol, Roy Lichtenstein, Jasper Johns, pop art";
const negativePrompt = "futuristic, stunningly beautiful, sharp focus, trending on instagram, trending on tumblr, HDR 4K, 8K', black background";

const generateAction = async (req, res) => {
  const { imgURL, prompt } = req.body;
  let response;
  if (prompt.length !== 0) {
    var raw = JSON.stringify({
      "key": process.env.STABLE_DIFFUSION_API_KEY,
      "prompt": `${promptPrefix}\n${prompt}`,
      "negative_prompt": negativePrompt,
      "width": "296",
      "height": "296",
      "samples": "1",
      "num_inference_steps": "1",
      "safety_checker": "no",
      "enhance_prompt": "yes",
      "seed": null,
      "guidance_scale": 7.5,
      "multi_lingual": "no",
      "panorama": "no",
      "self_attention": "no",
      "upscale": "no",
      "embeddings_model": "embeddings_model_id",
      "webhook": null,
      "track_id": null
    });
    response = await fetch("https://stablediffusionapi.com/api/v3/text2img", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: raw,
      redirect: 'follow'
    });
  } else {
    var raw = JSON.stringify({
      "key": process.env.STABLE_DIFFUSION_API_KEY,
      "prompt": promptPrefix,
      "negative_prompt": negativePrompt,
      "init_image": imgURL,
      "width": "296",
      "height": "296",
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
    response = await fetch("https://stablediffusionapi.com/api/v3/img2img", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: raw,
      redirect: 'follow'
    });
  }
  const resJSON = await response.json();
  const { output } = resJSON;
  res.status(200).json({ images: output });
};

export default generateAction;
