import styles from './canvas.module.css';
import React, { useState, useEffect, useRef } from 'react';
import LittleButton from '../little-button/little-button';
import { generateImg } from '../../utils/client/prompt-helpers';
import { saveImg } from '../../utils/client/db-helpers';
import { getLinkFromCloudinary } from '../../utils/client/cloudinary-helpers';
import { RiDeleteBin2Line } from 'react-icons/ri';

function Canvas({ logId, userId, saveSelectedImage, setAddImageToLog }) {
  const [canvasCtx, setCanvasCtx]: any = useState(null);
  const [mouseData, setMouseData]: any = useState({ x: null, y: null });
  const [color, setColor]: any = useState("#fff");
  const [size, setSize]: any = useState(10);
  const [generatedImages, setGeneratedImages]: any = useState([]);
  const [isGenerating, setIsGenerating]: any = useState(false);
  const [selectedImage, setSelectedImage]: any = useState(null);
  const canvasRef: any = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.canvas.width = 300;
    context.canvas.height = 300;
    setCanvasCtx(context);
  }, []);
  const setPos = (e) => {
    const canvas = canvasRef.current;
    const offset = canvas.getBoundingClientRect();
    setMouseData({ x: e.clientX - offset.left , y: e.clientY - offset.top });
  };
  const draw = (e) => {
    if (e.buttons !== 1) return;
    const ctx = canvasCtx;
    ctx.beginPath();
    ctx.moveTo(mouseData.x, mouseData.y);
    const canvas = canvasRef.current;
    const offset = canvas.getBoundingClientRect();
    setMouseData({
      x: e.clientX - offset.left,
      y: e.clientY - offset.top,
    });
    ctx.lineTo(e.clientX - offset.left, e.clientY - offset.top);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.stroke();
  };
  const generate = async () => {
    setIsGenerating(true);
    if (mouseData.x === null && mouseData.y === null) return;
    const canvas = canvasRef.current;
    const image = canvas.toDataURL("image/png");
    const publicallyAccessibleLink = await getPublicallyAccessibleLink(image);
    const images = await generateImg(publicallyAccessibleLink);
    setGeneratedImages(images);
    setIsGenerating(false);
  };
  const getPublicallyAccessibleLink = async (dataURI: string) => {
    const url = `https://api.cloudinary.com/v1_1/dg65si9dy/auto/upload`;
    const link = await getLinkFromCloudinary(url, dataURI);
    return link;
  };
  const saveGeneratedImage = async (imageURL: string) => {
    await saveImg(userId, logId, imageURL);
  };
  const setTouchPos = (e) => {
    if (e.touches.length !== 1) return;
    const canvas = canvasRef.current;
    const offset = canvas.getBoundingClientRect();
    setMouseData({ x: e.touches[0].clientX - offset.left, y: e.touches[0].clientY - offset.top });
  };
  const drawTouch = (e) => {
    if (e.touches.length !== 1) return;
    const ctx = canvasCtx;
    ctx.beginPath();
    ctx.moveTo(mouseData.x, mouseData.y);
    const canvas = canvasRef.current;
    const offset = canvas.getBoundingClientRect();
    setMouseData({
      x: e.touches[0].clientX - offset.left,
      y: e.touches[0].clientY - offset.top,
    });
    ctx.lineTo(e.touches[0].clientX - offset.left, e.touches[0].clientY - offset.top);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.stroke();
  };
  useEffect(() => {
    if (saveSelectedImage) {
      saveGeneratedImage(selectedImage).then();
      setAddImageToLog(false);
      setSelectedImage(null);
      setGeneratedImages([]);
    }
  }, [saveSelectedImage]);
  const selectImage = (url) => {
    if (selectedImage === url) {
      setSelectedImage(null);
      return;
    }
    setSelectedImage(url);
  };
  return (
        <div className={styles.container}>
          {
            generatedImages.length > 0
              ? (
                  <div>
                    {/* <div><img src={generatedImages[0]} onClick={() => selectImage(generatedImages[0])} style={{ border: generatedImages[0] === selectedImage ? "2px solid white" : "none" }} /></div> */}
                    <div><img src={generatedImages[1]} onClick={() => selectImage(generatedImages[1])} style={{ border: generatedImages[1] === selectedImage ? "2px solid white" : "none" }} /></div>
                    <div><img src={generatedImages[2]} onClick={() => selectImage(generatedImages[2])} style={{ border: generatedImages[2] === selectedImage ? "2px solid white" : "none" }} /></div>
                    <div><img src={generatedImages[3]} onClick={() => selectImage(generatedImages[3])} style={{ border: generatedImages[3] === selectedImage ? "2px solid white" : "none" }} /></div>
                  </div>
                )
              : (
                <>
                  <div className={styles.navigation}>
                    <div className={styles.control} onClick={() => setColor("aqua")} style={{ backgroundColor: "aqua" }} />
                    <div className={styles.control} onClick={() => setColor("#fdec03")} style={{ backgroundColor: "#fdec03" }} />
                    <div className={styles.control} onClick={() => setColor("#fff")} style={{ backgroundColor: "#fff" }} />
                    <div className={styles.control} onClick={() => setColor("#EF626C")} style={{ backgroundColor: "#EF626C" }} />
                    <input type="range" min={1} max={50} value={size} className={styles.range} onChange={(e) => setSize(e.target.value)} />
                  </div>
                  <canvas
                    ref={canvasRef}
                    onMouseEnter={(e) => setPos(e)}
                    onMouseMove={(e) => {
                      setPos(e)
                      draw(e)
                    }}
                    onMouseDown={(e) => setPos(e)}
                    onTouchMove={(e) => {
                      setTouchPos(e)
                      drawTouch(e)
                    }}
                    onTouchStart={(e) => setTouchPos(e)}
                    onTouchEnd={(e) => setTouchPos(e)}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <LittleButton mute={false} isGenerating={isGenerating} onClickAction={() => generate()}>generate!</LittleButton>
                    <div style={{ width: "2px" }} />
                    <LittleButton mute={false} isGenerating={false} onClickAction={() => {
                      const ctx = canvasCtx;
                      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                      setGeneratedImages([]);
                    }}>
                      <RiDeleteBin2Line size="25px" />
                    </LittleButton>
                  </div>
                </>
              )
            }
        </div>
  );
}

export default Canvas;