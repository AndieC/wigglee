/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import * as tmPose from '@teachablemachine/pose';
import { connect } from 'react-redux';
import { updateChild } from '../../Store';
import { LinearProgress, Typography } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';

//*********** UPDATE to {exercise.count}
let totalCount;
let startAnimation;
let startAnimation2;
let demoImg;

const SingleExercise = props => {
  const { match, selectedChild, updateChild, location } = props;
  const [finishedExercise, setFinished] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [showPhoto, setShowPhoto] = useState(true);

  totalCount = location.reps;
  demoImg = location.demo;
  console.log('LOCATION PROPS', location);

  const id = match.params.id;
  let previousPose;
  const URL = `https://teachablemachine.withgoogle.com/models/${id}/`;
  //depending on the id it will execute a different code
  let model, webcam, ctx;

  async function init() {
    const modelURL = URL + 'model.json';
    const metadataURL = URL + 'metadata.json';
    model = await tmPose.load(modelURL, metadataURL);

    // Convenience function to setup a webcam
    const size = 400;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(size, size, flip); // width, height, flip

    await webcam.setup({ facingMode: 'user' });
    let iosVid = document.getElementById('canvas');
    iosVid.appendChild(webcam.webcam);
    let videoElement = document.getElementsByTagName('video')[0];
    videoElement.setAttribute('playsinline', true);
    videoElement.muted = 'true';
    videoElement.id = 'webcamVideo';

    // request access to the webcam
    await webcam.play();
    startAnimation = window.requestAnimationFrame(loop);

    // append/get elements to the DOM
    const canvas = document.getElementById('canvas');
    canvas.width = size;
    canvas.height = size;
    ctx = canvas.getContext('2d');
  }
  async function loop() {
    webcam.update();
    await predict();
    startAnimation2 = window.requestAnimationFrame(loop);
  }

  async function predict() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    let repContainer = document.getElementById('rep-container');

    if (totalCount > 0) {
      if (prediction[0].probability.toFixed(2) >= 0.75) {
        if (prediction[0].className !== previousPose) {
          totalCount--;
          previousPose = prediction[0].className;
        }
      } else if (prediction[1].probability.toFixed(2) >= 0.75) {
        if (prediction[1].className !== previousPose) {
          totalCount--;
          repContainer.innerHTML = `You have ${Math.ceil(
            totalCount / 2
          )} left!`;
          previousPose = prediction[1].className;
        }
      }
    } else {
      await setFinished(true);
    }

    // finally draw the poses
    drawPose(pose);
  }

  function drawPose(pose) {
    if (webcam.canvas) {
      ctx.drawImage(webcam.canvas, 0, 0);
      // draw the keypoints and skeleton
      if (pose) {
        const minPartConfidence = 0.5;
        tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
        tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
      }
    }
  }

  useEffect(() => {
    init();
    console.log('USE EFFECT INIT CALLED');
    setTimeout(() => {
      setLoading(false);
      console.log('SHOW PHOTO TIMEOUT', isLoading);
    }, 5000);
  }, []);

  useEffect(() => {
    if (finishedExercise === true) {
      console.log('POINTS ADDING');
      return async function cleanup() {
        totalCount = location.reps;
        selectedChild.dailyPoints += 10;
        console.log('EXERCISE DAILY POINTS', selectedChild.dailyPoints);
        await updateChild(selectedChild);
        window.cancelAnimationFrame(startAnimation);
        window.cancelAnimationFrame(startAnimation2);
        setFinished(false);
      };
    }
  }, [finishedExercise]);

  return (
    <div>
      <div>
        {finishedExercise ? (
          <Redirect to="/congrats" />
        ) : (
          <>
            <img
              alt="demo"
              src={demoImg}
              hidden={!isLoading}
              style={{ maxWidth: '400px' }}
            />
            <canvas id="canvas" hidden={isLoading} />
          </>
        )}
      </div>
      {isLoading ? (
        <div>
          <LinearProgress />
        </div>
      ) : (
        <Typography id="rep-container" variant="h4">
          Ready, set, go!
        </Typography>
      )}
    </div>
  );
};

const mapState = state => {
  return {
    selectedChild: state.selectedChild,
  };
};
const mapDispatch = dispatch => {
  return {
    updateChild: selectedChild => dispatch(updateChild(selectedChild)),
  };
};
export default connect(mapState, mapDispatch)(SingleExercise);
