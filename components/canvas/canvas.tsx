import styles from './canvas.module.css';
import React, { useState, useEffect, useRef } from 'react';
import LittleButton from '../little-button/little-button';
import { generateImg } from '../../utils/client/prompt-helpers';
import { saveImg } from '../../utils/client/db-helpers';
import { getLinkFromCloudinary } from '../../utils/client/cloudinary-helpers';

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
    context.canvas.width = 310;
    context.canvas.height = 310;
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
    const images = await generateImg(publicallyAccessibleLink, "finish the drawing");
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
  useEffect(() => {
    if (saveSelectedImage) {
      saveGeneratedImage(selectedImage).then();
      setAddImageToLog(false);
      setSelectedImage(null);
      setGeneratedImages([]);
    }
  }, [saveSelectedImage]);
  return (
    <div className={styles.container}>
      {
        generatedImages.length > 0
          ? (
              <div style={{ display: "flex", flexDirection: "column" }}>
                { generatedImages.map((imageURL, index) => (
                  <img
                    key={index}
                    src={imageURL}
                    alt="generated"
                    onClick={() => setSelectedImage(imageURL)}
                    style={{ border: imageURL === selectedImage ? "2px solid white" : "none" }}
                  />
                )) }
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
                  setPos(e)
                  draw(e)
                }}
                onTouchStart={(e) => setPos(e)}
                onTouchEnd={(e) => setPos(e)}
              />
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <LittleButton mute={false} isGenerating={isGenerating} onClickAction={() => generate()}>generate</LittleButton>
                <div style={{ width: "2px" }} />
                <LittleButton mute={false} isGenerating={false} onClickAction={() => {
                  const ctx = canvasCtx;
                  ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                  setGeneratedImages([]);
                }}>
                  clear
                </LittleButton>
              </div>
            </>
          )
        }
  </div>
  );
}

export default Canvas;