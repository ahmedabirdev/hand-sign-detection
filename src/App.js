import React, { useCallback, useEffect, useRef, useState } from "react";
import "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import './App.css';
import { drawHand } from "./utils";
import * as fp from "fingerpose";
import ThumbsDownGesture from "./gestures/ThumbsDown.js";
import MiddleFingerGesture from "./gestures/MiddleFinger.js";
import OKSignGesture from "./gestures/OKSign.js";
import PinchedFingerGesture from "./gestures/PinchedFinger.js";
import PinchedHandGesture from "./gestures/PinchedHand.js";
import RaisedHandGesture from "./gestures/RaisedHand.js";
import LoveYouGesture from "./gestures/LoveYou.js";
import RockOnGesture from "./gestures/RockOn.js";
import CallMeGesture from "./gestures/CallMe.js";
import PointUpGesture from "./gestures/PointUp.js";
import PointDownGesture from "./gestures/PointDown.js";
import PointRightGesture from "./gestures/PointRight.js";
import PointLeftGesture from "./gestures/PointLeft.js";
import RaisedFistGesture from "./gestures/RaisedFist.js";
import victory from "./img/victory.png";
import thumbs_up from "./img/thumbs_up.png";
import thumbs_down from "./img/thumbs_down.png";
import middle_finger from "./img/middle_finger.png";
import ok_sign from "./img/ok_sign.png";
import pinched_finger from "./img/pinched_finger.png";
import pinched_hand from "./img/pinched_hand.png";
import raised_hand from "./img/raised_hand.png";
import love_you from "./img/love_you.png";
import rock_on from "./img/rock_on.png";
import call_me from "./img/call_me.png";
import point_up from "./img/point_up.png";
import point_down from "./img/point_down.png";
import point_left from "./img/point_left.png";
import point_right from "./img/point_right.png";
import raised_fist from "./img/raised_fist.png";


function App() {
  const [facingMode, setFacingMode] = useState("user");
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [emoji, setEmoji] = useState(null);
  const images = {
    thumbs_up: thumbs_up,
    victory: victory,
    thumbs_down: thumbs_down,
    middle_finger: middle_finger,
    ok_sign: ok_sign,
    pinched_finger: pinched_finger,
    pinched_hand: pinched_hand,
    raised_hand: raised_hand,
    love_you: love_you,
    rock_on: rock_on,
    call_me: call_me,
    point_up: point_up,
    point_down: point_down,
    point_left: point_left,
    point_right: point_right,
    raised_fist: raised_fist
  };




  const detect = useCallback(async (net) => {
    const webcam = webcamRef.current;
    const canvas = canvasRef.current;

    if (
      webcam &&
      webcam.video &&
      webcam.video.readyState === 4
    ) {
      const video = webcam.video;

      // 👉 Use rendered size, NOT 640x480
      const { width, height } = video.getBoundingClientRect();

      canvas.width = width;
      canvas.height = height;

      const hand = await net.estimateHands(video, true);

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, width, height);

      ctx.save();

      // Mirror only if user camera
      if (facingMode === "user") {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }

      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          fp.Gestures.ThumbsUpGesture,
          ThumbsDownGesture,
          MiddleFingerGesture,
          OKSignGesture,
          PinchedFingerGesture,
          PinchedHandGesture,
          RaisedHandGesture,
          LoveYouGesture,
          RockOnGesture,
          CallMeGesture,
          PointUpGesture,
          PointDownGesture,
          PointLeftGesture,
          PointRightGesture,
          RaisedFistGesture,
        ]);

        const gesture = GE.estimate(hand[0].landmarks, 5);

        if (gesture.gestures?.length) {
          const best = gesture.gestures.reduce((a, b) =>
            a.score > b.score ? a : b
          );
          setEmoji(best.name);
        }
      }

      drawHand(hand, ctx);
      ctx.restore();
    }
  }, [facingMode]);

  const runHandpose = useCallback(async () => {
    const net = await handpose.load();

    const video = webcamRef.current.video;

    video.onloadedmetadata = () => {
      const loop = async () => {
        await detect(net);
        requestAnimationFrame(loop);
      };
      loop();
    };
  }, [detect]);


  useEffect(() => {
    runHandpose();
  }, [runHandpose]);

  return (
    <div className="App">
      <h1 className="app-title">Hand Sign Detection Model</h1>

      <div className="camera-wrapper">
        {/* Webcam */}
        <Webcam
          ref={webcamRef}
          videoConstraints={{ facingMode }}
          className="webcam"
        />

        {/* Canvas */}
        <canvas ref={canvasRef} className="canvas" />

        {/* Emoji */}
        {emoji && (
          <img
            src={images[emoji]}
            alt={emoji}
            className="gesture-emoji"
          />
        )}
      </div>

      {/* Gesture Name */}
      {emoji && (
        <div className="gesture-name">
          {emoji.replace("_", " ")}
        </div>
      )}

      {/* Flip Button */}
      <button
        className="flip-btn"
        onClick={() =>
          setFacingMode((prev) =>
            prev === "user" ? "environment" : "user"
          )
        }
      >
        Flip Camera
      </button>
    </div>
  );

}

export default App;