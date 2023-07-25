'use strict';
import DID_API from './api.json' assert { type: 'json' };

if (DID_API.key == '🤫') alert('Please put your api key inside ./api.json and restart..');

const RTCPeerConnection = (
  window.RTCPeerConnection ||
  window.webkitRTCPeerConnection ||
  window.mozRTCPeerConnection
).bind(window);

let peerConnection;
let streamId;
let sessionId;
let sessionClientAnswer;

let statsIntervalId;
let videoIsPlaying;
let lastBytesReceived;

let conversationId = null;

let recognized;
let recognition;
let recognitionState = false;

const talkVideo = document.getElementById('talk-video');
const talkVideoStream = document.getElementById('talk-video-stream');
// const videoWrapper = document.getElementById('video-wrapper');
// talkVideo.setAttribute('playsinline', '');
const peerStatusLabel = document.getElementById('peer-status-label');
const iceStatusLabel = document.getElementById('ice-status-label');
const iceGatheringStatusLabel = document.getElementById('ice-gathering-status-label');
const signalingStatusLabel = document.getElementById('signaling-status-label');
const streamingStatusLabel = document.getElementById('streaming-status-label');

addEventListener('load', () => {
  connect();
})

const connectButton = document.getElementById('connect-button');
// connectButton.onclick = connect;

async function connect() {
  if (peerConnection && peerConnection.connectionState === 'connected') {
    return;
  }

  stopAllStreams();
  closePC();

  const sessionResponse = await fetchWithRetries(`${DID_API.url}/talks/streams`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${DID_API.key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_url: 'https://d-id-public-bucket.s3.amazonaws.com/or-roman.jpg',
    }),
  });

  const { id: newStreamId, offer, ice_servers: iceServers, session_id: newSessionId } = await sessionResponse.json();
  streamId = newStreamId;
  sessionId = newSessionId;

  try {
    sessionClientAnswer = await createPeerConnection(offer, iceServers);
  } catch (e) {
    console.log('error during streaming setup', e);
    stopAllStreams();
    closePC();
    return;
  }

  const sdpResponse = await fetch(`${DID_API.url}/talks/streams/${streamId}/sdp`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${DID_API.key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      answer: sessionClientAnswer,
      session_id: sessionId,
    }),
  });
}

const say = async (input = 'Heavy Metal') => {
  // connectionState not supported in firefox
  if (peerConnection?.signalingState === 'stable' || peerConnection?.iceConnectionState === 'connected') {
    const talkResponse = await fetchWithRetries(`${DID_API.url}/talks/streams/${streamId}`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${DID_API.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        script: {
          type: 'text',
          subtitles: 'false',
          provider: { type: 'microsoft', voice_id: 'en-US-JennyNeural' },
          ssml: 'true',
          input,
        },
        driver_url: 'bank://lively',
        config: {
          fluent: true,
          pad_audio: 0,
          // driver_expressions: {
          //   expressions: [{expression: 'neutral', start_frame: 0, intensity: 0}],
          //   transition_frames: 0
          // },
          // align_driver: true,
          // align_expand_factor: 0,
          // auto_match: true,
          // motion_factor: 0,
          // normalization_factor: 0,
          // sharpen: true,
          stitch: true,
          // result_format: 'mp4',
          fluent: true,
        },
        session_id: sessionId,
      }),
    });
  }
};

const talkButton = document.getElementById('talk-button');
// talkButton.onclick = say();

const destroyButton = document.getElementById('destroy-button');
// destroyButton.onclick = destroy;

addEventListener('unload', destroy);

async function destroy() {
  await fetch(`${DID_API.url}/talks/streams/${streamId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Basic ${DID_API.key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ session_id: sessionId }),
  });

  stopAllStreams();
  closePC();
}


const chatButton = document.getElementById('chat-button');
const conversation = document.getElementById('speech');
const microphoneIcon = document.getElementsByClassName('fa-microphone')[0];
const sendIcon = document.getElementsByClassName('fa-paper-plane')[0];

conversation.addEventListener('input', (event) => {
  if (event.target.value.length > 0) {
    recognitionState = true;

    sendIcon.style.display = 'block';
    microphoneIcon.style.display = 'none';
  }
  else {
    recognitionState = false;
    sendIcon.style.display = 'none';
    microphoneIcon.style.display = 'block';
  };
});

chatButton.onclick = async () => {
  recognitionState = !recognitionState;
  // TODO: Refactor

  // If user entered text manually setting it that it was already recognized;
  if (recognitionState) {
    if (recognition) recognition.start();

    sendIcon.style.display = 'block';
    microphoneIcon.style.display = 'none';
  }
  else {
    sendIcon.style.display = 'none';
    microphoneIcon.style.display = 'block';
  }

  if (conversation.value.length > 0) {
    recognized = true;
    recognitionState = false;
  } else {
    await recognize();
    recognized = true;
    recognitionState = false;

    // Refactor
    sendIcon.style.display = 'none';
    microphoneIcon.style.display = 'block';

  }

  if (recognized) {
    if (recognition) recognition.stop();
  }

  var raw = conversation.value;

  if (!recognitionState) {
    ask(raw);
    conversation.value = '';
  }
};

async function recognize() {
  return new Promise(async (resolve, reject) => {
    recognitionState = true;

    await getLocalStream();

    recognition = recognitionFactory();

    recognition.lang = 'en-US'; // Set language (e.g., US English)
    recognition.continuous = true; // Enable continuous recognition
    recognition.interimResults = false; // Get interim results as the user speaks

    recognition.start();

    recognition.onresult = function (event) {
      const transcript = event.results[event.results.length - 1][0].transcript;

      conversation.value = transcript;

      console.log('Recognized speech:', transcript);
      resolve(transcript);
    };

    recognition.onend = function () {
      console.log('Speech recognition ended.');
      // recognition.stop();
    };
  });
}

async function getLocalStream() {
  await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
}

const recognitionFactory = () => {
  const detectedBrowser = detectBrowser();

  switch (detectedBrowser) {
    case 'Google Chrome':
      return new webkitSpeechRecognition(); // Chrome
    default:
      return new SpeechRecognition(); // Firefox, Edge
  }
};

function ask(raw) {
  console.log('Asking...');
  // return;
  conversation.value = '';

  const myHeaders = {
    'CLIENT-ID': DID_API.humain,
    'Content-Type': 'text/plain',
  };

  if (conversationId) myHeaders['Conversation-Id'] = conversationId;

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  fetch('https://chatwith.humains.com/bot', requestOptions)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }

      conversationId = response.headers.get('Conversation-Id');

      const buffer = await response.arrayBuffer();
      const decoder = new TextDecoder('utf-8');
      const readableString = decoder.decode(buffer);
      return readableString;
    })
    .then((result) => {
      say(result);
      console.log(result);
    })
    .catch((error) => console.log('error: ', error));
};

function onIceGatheringStateChange() {
  // iceGatheringStatusLabel.innerText = peerConnection.iceGatheringState;
  // iceGatheringStatusLabel.className = 'iceGatheringState-' + peerConnection.iceGatheringState;
}

function onIceCandidate(event) {
  console.log('onIceCandidate', event);
  if (event.candidate) {
    const { candidate, sdpMid, sdpMLineIndex } = event.candidate;

    fetch(`${DID_API.url}/talks/streams/${streamId}/ice`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${DID_API.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        candidate,
        sdpMid,
        sdpMLineIndex,
        session_id: sessionId,
      }),
    });
  }
}
function onIceConnectionStateChange() {
  // iceStatusLabel.innerText = peerConnection.iceConnectionState;
  // iceStatusLabel.className = 'iceConnectionState-' + peerConnection.iceConnectionState;
  if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'closed') {
    stopAllStreams();
    closePC();
  }
}
function onConnectionStateChange() {
  // not supported in firefox
  // peerStatusLabel.innerText = peerConnection.connectionState;
  // peerStatusLabel.className = 'peerConnectionState-' + peerConnection.connectionState;
}
function onSignalingStateChange() {
  // signalingStatusLabel.innerText = peerConnection.signalingState;
  // signalingStatusLabel.className = 'signalingState-' + peerConnection.signalingState;
}

function onVideoStatusChange(videoIsPlaying, stream) {
  let status;
  if (videoIsPlaying) {
    status = 'streaming';
    const remoteStream = stream;
    setVideoElement(remoteStream);
  } else {
    status = 'empty';
    playIdleVideo();
  }
  // streamingStatusLabel.innerText = status;
  // streamingStatusLabel.className = 'streamingState-' + status;
}

function onTrack(event) {
  /**
   * The following code is designed to provide information about wether currently there is data
   * that's being streamed - It does so by periodically looking for changes in total stream data size
   *
   * This information in our case is used in order to show idle video while no talk is streaming.
   */

  if (!event.track) return;

  statsIntervalId = setInterval(async () => {
    const stats = await peerConnection.getStats(event.track);
    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
        const videoStatusChanged = videoIsPlaying !== report.bytesReceived > lastBytesReceived;

        if (videoStatusChanged) {
          videoIsPlaying = report.bytesReceived > lastBytesReceived;
          onVideoStatusChange(videoIsPlaying, event.streams[0]);
        }
        lastBytesReceived = report.bytesReceived;
      }
    });
  }, 500);
  // setTimeout(() => {
  //   videoIsPlaying = true;
  //   onVideoStatusChange(videoIsPlaying, event.streams[0]);
  // }, 3000);
}

async function createPeerConnection(offer, iceServers) {
  if (!peerConnection) {
    peerConnection = new RTCPeerConnection({ iceServers });
    peerConnection.addEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
    peerConnection.addEventListener('icecandidate', onIceCandidate, true);
    peerConnection.addEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
    peerConnection.addEventListener('connectionstatechange', onConnectionStateChange, true);
    peerConnection.addEventListener('signalingstatechange', onSignalingStateChange, true);
    peerConnection.addEventListener('track', onTrack, true);
  }

  await peerConnection.setRemoteDescription(offer);
  console.log('set remote sdp OK');

  const sessionClientAnswer = await peerConnection.createAnswer();
  console.log('create local sdp OK');

  await peerConnection.setLocalDescription(sessionClientAnswer);
  console.log('set local sdp OK');

  return sessionClientAnswer;
}

function setVideoElement(stream) {
  talkVideoStream.style.zIndex = 3;

  if (!stream) return;
  talkVideoStream.srcObject = stream;
  talkVideoStream.loop = false;

  // safari hotfix
  if (talkVideo.paused) {
    talkVideo
      .play()
      .then((_) => {})
      .catch((e) => {});
  }
}

function playIdleVideo() {
  talkVideoStream.style.zIndex = 1;

  talkVideo.srcObject = undefined;
  talkVideo.src = 'or_idle.mp4';
  talkVideo.loop = true;
}

function stopAllStreams() {
  if (talkVideoStream.srcObject || talkVideoStream.src) {
    console.log('stopping video streams');
    talkVideoStream.srcObject.getTracks().forEach((track) => track.stop());
    talkVideoStream.srcObject = null;
  }
}

function closePC(pc = peerConnection) {
  if (!pc) return;
  console.log('stopping peer connection');
  pc.close();
  pc.removeEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
  pc.removeEventListener('icecandidate', onIceCandidate, true);
  pc.removeEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
  pc.removeEventListener('connectionstatechange', onConnectionStateChange, true);
  pc.removeEventListener('signalingstatechange', onSignalingStateChange, true);
  pc.removeEventListener('track', onTrack, true);
  clearInterval(statsIntervalId);
  // iceGatheringStatusLabel.innerText = '';
  // signalingStatusLabel.innerText = '';
  // iceStatusLabel.innerText = '';
  // peerStatusLabel.innerText = '';
  console.log('stopped peer connection');
  if (pc === peerConnection) {
    peerConnection = null;
  }
}

const maxRetryCount = 3;
const maxDelaySec = 4;

async function fetchWithRetries(url, options, retries = 1) {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries <= maxRetryCount) {
      const delay = Math.min(Math.pow(2, retries) / 4 + Math.random(), maxDelaySec) * 1000;

      await new Promise((resolve) => setTimeout(resolve, delay));

      console.log(`Request failed, retrying ${retries}/${maxRetryCount}. Error ${err}`);
      return fetchWithRetries(url, options, retries + 1);
    } else {
      throw new Error(`Max retries exceeded. error: ${err}`);
    }
  }
}

function detectBrowser() {
  const userAgent = navigator.userAgent;
  let browser = "Unknown";

  if (userAgent.indexOf("Chrome") !== -1) {
    browser = "Google Chrome";
  } else if (userAgent.indexOf("Firefox") !== -1) {
    browser = "Mozilla Firefox";
  } else if (userAgent.indexOf("Edge") !== -1) {
    browser = "Microsoft Edge";
  } else if (userAgent.indexOf("Safari") !== -1) {
    browser = "Apple Safari";
  } else if (userAgent.indexOf("Opera") !== -1 || userAgent.indexOf("OPR") !== -1) {
    browser = "Opera";
  } else if (userAgent.indexOf("Trident") !== -1) {
    browser = "Internet Explorer";
  }

  return browser;
}
