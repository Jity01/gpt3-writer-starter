import React from "react";
import Example from "../components/example/example";

function Instructions() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ padding: "25px", maxWidth: "700px" }}>
      <div style={{ padding: "30px"}}>
        <div style={{ display: "flex", justifyContent: "center", fontSize: "2.5rem", fontWeight: "bold", color: "hsl(72, 82%, 69%)" }}>
            welcome to reinforce!
        </div>
        <br />
        <p>reinforce is a <span style={{ fontSize: "larger", "fontWeight": "bold", textDecoration: "underline" }}>mini journal</span> meant to be a home for all of the little insights that you have throughout the day.</p>
        <p>the hope is to make you feel more connected to your values, and with those connections, to help you <span style={{ fontSize: "larger", "fontWeight": "bold", textDecoration: "underline" }}>solve your problems</span> more effectively.</p>
      </div>
      <div style={{ fontSize: "1.5rem", color: "hsl(72, 82%, 69%)" }}>
        <h3>&emsp;here&apos;s how it works:</h3>
      </div>
      <ol>
        <li>when you have an insightful thought you&apos;d like to record, hit the &quot;log&quot; button to save it as a new journal entry</li>
        <p style={{ color: "hsl(174, 69%, 40%)"}}>💡tip: as you&apos;re logging, hit &quot;return&quot; three times to get questions that&apos;ll help you reflect better</p>
        <br />
        <Example>
          <p>&quot;michael said a lot of ideas that you have might actually be really stupid - ineffective AND distracting. that might be something you wanna consider before attaching yourself too heavily to any one of them.&quot;</p>
        </Example>
        <br />
        <li>whenever you have problems, hit the glowing blue button to turn on search mode - this allows you to search through your thoughts to get assistance from your past writings</li>
        <p style={{ color: "hsl(174, 69%, 40%)"}}>💡tip: as you&apos;re searching, hit &quot;return&quot; three times to get questions that&apos;ll help you express your emotions better</p>
        <br />
        <Example>
          <p>i searched about being unusually distracted and this was one of the logs that came up - funny but effective!</p>
          <p>you have to stop playing with your hair when you&apos;re thinking bro it&apos;s so distracting. i&apos;m writing this down because i am +begging+ you to stop. i&apos;m so done with this.</p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <img src="https://cdn.stablediffusionapi.com/generations/bafbb63c-3308-4df2-a9da-f81bdeb00dce-0.png" width="300" height="300" />
          </div>
        </Example>
        <br />
        <li>finally! whenever you feel like you need extra guidance or you feel inspired, you can &quot;talk&quot; to your logs by hitting the talk button associated with each one of them  :)</li>
        <div style={{ fontSize: "1.3rem", color: "hsl(72, 82%, 69%)" }}>
          <h3>tools for when you&apos;re logging</h3>
        </div>
        <br />
        <li>if you hit the little draw button, you can get images that correspond with what you&apos;re logging to help you express the unexpressable.</li>
        <p style={{ color: "hsl(174, 69%, 40%)"}}>💡tip: make a custom image by drawing a sketch of it and then hitting &quot;generate&quot; to get an image inspired by your drawing!</p>
        <Example>
          <p>an image i got when i logged something about confusion</p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <img src="https://pub-8b49af329fae499aa563997f5d4068a4.r2.dev/generations/0f922b5e-fa75-42eb-8fcd-85210428d7a5-0.png" width="228" />
          </div>
        </Example>
        <br />
        <li>if you hit the little music button, you can input music that corresponds with what you&apos;re saying. right now, you can only input youtube links. (working on this!)</li>
        <br />
        <Example>
          <p>a song that i listen to every time i read my fav log about the importance of accepting where you are</p>
          <iframe src="https://www.youtube.com/embed/-aX3Wiy_Fg8" width="100%" height="300px" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </Example>
        <br />
        <br />
        <p>if you want to use this, have questions, comments (IDEAS!!), and/or concerns, say hi @ jmegametric@gmail.com :)</p>
        <a href="https://calendly.com/jity-woldemichael/15min" style={{ color: "yellowgreen" }}>if you&apos;re a wild one, you can also just straight up schedule a meeting with me! </a>
      </ol>
    </div>
    </div>
  );
}

export default Instructions;
