import styles from './canvas.module.css';
import React, { useState, useEffect, useRef } from 'react';
import LittleButton from '../little-button/little-button';
import { generateImg } from '../../utils/client/prompt-helpers';
import { saveImg } from '../../utils/client/db-helpers';
import { getLinkFromCloudinary } from '../../utils/client/cloudinary-helpers';

function Canvas({ logId, userId }) {
  const [canvasCtx, setCanvasCtx]: any = useState(null);
  const [mouseData, setMouseData]: any = useState({ x: null, y: null });
  const [color, setColor]: any = useState(null);
  const [size, setSize]: any = useState(10);
  const [generatedImages, setGeneratedImages]: any = useState([]);
  const canvasRef: any = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = "300";
    canvas.height = "340";
    setCanvasCtx(context);
  }, []);
  const setPos = (e) => {
    setMouseData({ x: e.clientX, y: e.clientY });
  };
  const draw = (e) => {
    if (e.buttons !== 1) return;
    const ctx = canvasCtx;
    ctx.beginPath();
    ctx.moveTo(mouseData.x, mouseData);
    setMouseData({
      x: e.clientX,
      y: e.clientY
    });
    ctx.lineTo(e.clientX, e.clientY);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.stroke();
  };
  const generate = async () => {
    if (mouseData.x === null && mouseData.y === null) return;
    const canvas = canvasRef.current;
    const image = canvas.toDataURL("image/png");
    const publicallyAccessibleLink = await getPublicallyAccessibleLink(image);
    const images = await generateImg(publicallyAccessibleLink, "finish the drawing");
    setGeneratedImages(images);
  };
  const getPublicallyAccessibleLink = async (dataURI: string) => {
    const url = `https://api.cloudinary.com/v1_1/dg65si9dy/auto/upload`;
    const link = await getLinkFromCloudinary(url, dataURI);
    return link;
  };
  const saveGeneratedImage = async (imageURL: string) => {
    await saveImg(userId, logId, imageURL);
  };
  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        style={{ backgroundColor: "hsl(160, 53%, 21%)" }}
        onMouseEnter={(e) => setPos(e)}
        onMouseMove={(e) => {
          setPos(e)
          draw(e)
        }}
        onMouseDown={(e) => setPos(e)}
      />
      <div className={styles.navigation}>
        <div className={styles.control} onClick={() => setColor("aqua")} style={{ backgroundColor: "aqua" }} />
        <div className={styles.control} onClick={() => setColor("#fdec03")} style={{ backgroundColor: "#fdec03" }} />
        <div className={styles.control} onClick={() => setColor("#24d102")} style={{ backgroundColor: "#24d102" }} />
        <div className={styles.control} onClick={() => setColor("#fff")} style={{ backgroundColor: "#fff" }} />
        <div className={styles.control} onClick={() => setColor("#EF626C")} style={{ backgroundColor: "#EF626C" }} />
        <input type="range" min={1} max={50} value={size} className={styles.range} onChange={(e) => setSize(e.target.value)} />
        <LittleButton mute={false} isGenerating={false} onClickAction={() => {
          const ctx = canvasCtx;
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          setGeneratedImages([]);
        }}>clear</LittleButton>
        <LittleButton mute={false} isGenerating={false} onClickAction={() => generate()}>generate</LittleButton>
        { generatedImages.map((imageURL, index) => (
            <img key={index} src={imageURL} alt="generated" onClick={() => saveGeneratedImage(imageURL)} />
        )) }
      </div>
    </div>
  );
}

export default Canvas;