// 'use strict';
// import DID_API from '../api.json';
// import CUSTOM from './custom.json';

let DID_API;
let CUSTOM

// alert('out');

const loadJSON = async () => {
  // alert('in');

  const respo = await fetch("../api.json");
  DID_API = await respo.json();

  const resp = await fetch("./custom.json");
  CUSTOM = await resp.json();

  console.log(CUSTOM);

  if (DID_API.key == '🤫') alert('Please put your api key inside ./api.json and restart..');

  let conversationId = null;

  let muted = false;
  let botSpeaking = false;
  let recognized;

  getLocalStream();

  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  var recognition = new SpeechRecognition();

  recognition.lang = CUSTOM.recognition_lang; // Set language (e.g., US English)
  recognition.continuous = false; // Enable continuous recognition
  recognition.interimResults = false; // Get interim results as the user speaks

  let recognitionState = false;

  let aiResponseGlobal;

  const idleUrl = CUSTOM.idle_url;

  const talkVideo = document.getElementById('talk-video');
  const talkVideoStream = document.getElementById('talk-video-stream');

  detectBrowser();

  const muteButton = document.getElementById('mute-button');
  const volumeHigh = document.getElementById('volume-high');
  const volumeOff = document.getElementById('volume-off');
  const volumeHighMobile = document.getElementById('volume-high-mobile');
  const volumeOffMobile = document.getElementById('volume-off-mobile');

  const speed = document.getElementById('playback-speed');
  const speedMobile = document.getElementById('playback-speed-mobile');

  const poweredBy = document.getElementById('powered-by');

  let playbackSpeed = 1;
  const playbackSpeedValues = [1, 1.5, 2];
  let playbackSpeedClicked = 0;

  document.addEventListener('load', () => {
    connect();
  });

  const speedClick = () => {
    playbackSpeedClicked += 1;
    
    playbackSpeed = playbackSpeedValues[playbackSpeedClicked % 3];
    talkVideoStream.playbackRate = playbackSpeed;
    speed.innerHTML = playbackSpeedValues[playbackSpeedClicked % 3] + 'x';
    speedMobile.innerHTML = playbackSpeedValues[playbackSpeedClicked % 3] + 'x';
  };

  const setPlaybackRate = (playbackRate) => {
    talkVideoStream.playbackRate = playbackRate;
  }

  speed.addEventListener('click', () => {
    speedClick();
  });

  speedMobile.addEventListener('click', (e) => {
    e.stopPropagation();

    speedClick();
  });

  const muteButtonClick = () => {
    muted = !muted;

    if (muted) {
      talkVideoStream.muted = "muted";

      volumeHigh.classList.add('d-none');
      volumeOff.classList.remove('d-none');
      volumeHighMobile.classList.add('d-none');
      volumeOffMobile.classList.remove('d-none');
    } else {
      talkVideoStream.muted = "";

      volumeHigh.classList.remove('d-none');
      volumeOff.classList.add('d-none');
      volumeHighMobile.classList.remove('d-none');
      volumeOffMobile.classList.add('d-none');
    }
  }

  volumeHighMobile.addEventListener('click', (e) => {
    e.stopPropagation();
    
    muteButtonClick();
  });

  volumeOffMobile.addEventListener('click', (e) => {
    e.stopPropagation();
    
    muteButtonClick();
  });

  muteButton.addEventListener('click', () => {
    muteButtonClick();
  });

  async function connect() {
    playIdleVideo();
  }

  connect();

  talkVideoStream.addEventListener('ended', () => {
    console.log('Ended');

    playIdleVideo();
  });

  const say = async (input = 'Heavy Metal') => {
    try {
      const talkResponse = await fetchWithRetries(`${DID_API.url}/animations/v3/generate_lipsync`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${DID_API.key}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          text: input,
          idle_url: idleUrl,
          azure_voice: CUSTOM.voice,
        })
      });

      const videoBlob = await talkResponse.blob();
      // Create an Object URL for the Blob.
      const videoURL = URL.createObjectURL(videoBlob);

      if (input) {
        // helpMessageInner.innerHTML += `<p style="color: #14C6F1; width: 75%;">${input}</p>`;
        helpMessageInner.innerHTML += `
        <div class="d-flex chat-bot-background mb-2">
          <span class="d-flex">
            <span style="background-color: #BCDDE6; padding: 18px; border-radius: 10px; max-width: 75%;">${input}</span>
          </span>
        </div>
        `;
        helpMessageInner.scrollTo({top: 99999, behavior: 'smooth'});
      }

      setVideoElement(videoURL)
    }
    catch(error) {
      console.log(error);
    }
  };

  const talkButton = document.getElementById('talk-button');

  const chatButton = document.getElementById('chat-button');
  const chatForm = document.getElementById('chat-form');
  const conversation = document.getElementById('speech');

  const microphoneIcon = document.getElementById('microphone-icon');
  // const sendIcon = document.getElementById('send-icon');
  const ellipsis = document.getElementById('ellipsis');

  talkButton.addEventListener('click', (e) => {
    recognize();
  });

  conversation.addEventListener('input', (event) => {
    if (event.target.value.length > 0) {
      recognitionState = true;

      // sendIcon.style.display = 'block';
      // microphoneIcon.style.display = 'none';
      chatButton.classList.remove('d-none');
      talkButton.classList.add('d-none');
    }
    else {
      recognitionState = false;
      // sendIcon.style.display = 'none';
      // microphoneIcon.style.display = 'block';
      chatButton.classList.add('d-none');
      talkButton.classList.remove('d-none');
    };
  });

  const helpMessageInner = document.getElementById('help-message-inner');
  const loading = document.getElementById('loading');
  const loadingMobile = document.getElementById('loading-mobile');
  // chatButton.onclick = async () => {
  const submitHandler = () => {
    if (conversation.value === '') return;

    // let micOnClicked = false;
    // if (microphoneIcon.style.display === 'block') {
    //   micOnClicked = true;
    // }

    loading.classList.remove('d-none');
    loadingMobile.classList.remove('d-none');

    recognitionState = !recognitionState;
    // TODO: Refactor

    // If user entered text manually setting it that it was already recognized;
    if (recognitionState) {
      // if (recognition) recognition.start();
      recognized = true;
      // sendIcon.style.display = 'block';
      // microphoneIcon.style.display = 'none';
      chatButton.classList.remove('d-none');
      talkButton.classList.add('d-none');
    }
    else {
      // sendIcon.style.display = 'none';
      // microphoneIcon.style.display = 'block';
      chatButton.classList.add('d-none');
      talkButton.classList.remove('d-none');
    }

    if (conversation.value.length > 0) {
      recognized = true;
      recognitionState = false;
    } else {
      // if (!muted && !botSpeaking && micOnClicked) {
      //   await recognize();
      // }

      // recognized = true;
      // recognitionState = false;

      // Refactor
      // sendIcon.style.display = 'none';
      // microphoneIcon.style.display = 'block';
      chatButton.classList.add('d-none');
      talkButton.classList.remove('d-none');
    }

    // if (recognized) {
    //   if (recognition) recognition.stop();
    // }

    let raw;
    raw = conversation.value;
    // helpMessageInner.innerHTML += `<p class="align-self-end" style="text-align: left; color: black; width: 75%;">${raw}</p>`;
    helpMessageInner.innerHTML +=  `
    <div class="d-flex align-self-end mb-3">
      <span class="d-flex">
        <span style="background-color: #fff; padding: 18px; border-radius: 10px;">${raw}</span>
      </span>
    </div>
    `;
    helpMessageInner.scrollTo({top: 99999, behavior: 'smooth'});

    if (!recognitionState) {
      ask(raw);
      conversation.value = '';
    }
  }

  chatForm.onsubmit = async (e) => {
    e.preventDefault();

    microphoneIcon.classList.remove('d-none');
    ellipsis.classList.add('d-none');

    submitHandler();
  };

  function recognize() {
    microphoneIcon.classList.add('d-none');
    ellipsis.classList.remove('d-none');
    recognitionState = true;

    recognition.start();
  }

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    // const transcript = event.results[event.results.length - 1][0].transcript;
    
    // alert(transcript);

    recognized = true;
    recognitionState = false;

    conversation.value = transcript;

    console.log('Recognized speech:', transcript);

    microphoneIcon.classList.remove('d-none');
    ellipsis.classList.add('d-none');

    submitHandler();
  };

  recognition.onspeechend = function () {
    console.log('Speech recognition ended.');
    recognition.stop();

  };

  recognition.onnomatch = function(event) {
    alert("I didn't recognise that color.");
    // recognition.stop();

    microphoneIcon.classList.remove('d-none');
    ellipsis.classList.add('d-none');
  }

  recognition.onerror = function(event) {
    console.log('Error occurred in recognition: ' + event.error);
  }

  async function getLocalStream() {
    await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
  }

  function ask(raw) {
    console.log('Asking...');
    // return;
    conversation.value = '';

    const myHeaders = {
      'CLIENT-ID': CUSTOM.humain,
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

        if (!conversationId) {
          conversationId = response.headers.get('Conversation-Id');
          if (!conversationId) conversationId = getToken();
        }

        const buffer = await response.arrayBuffer();
        const decoder = new TextDecoder('utf-8');
        const readableString = decoder.decode(buffer);
        return readableString;
      })
      .then((result) => {
        loading.classList.add('d-none');
        loadingMobile.classList.add('d-none');

        say(result);
        aiResponseGlobal = result;
        console.log(result);

        chatButton.classList.add('d-none');
        talkButton.classList.remove('d-none');
      })
      .catch((error) => console.log('error: ', error));
  };

  // talkVideoStream.onerror(() => {
  //   playIdleVideo();
  // });

  function setVideoElement(videoUrl) {
    botSpeaking = true;

    requestAnimationFrame(() => {
      talkVideo.classList.remove('item-fade');
      talkVideo.classList.add('item-fade-out');
    
      talkVideoStream.classList.remove('item-fade-out');
      talkVideoStream.classList.add('item-fade');
    });
    
    // muteButton.classList.remove('d-none');
    // I guessed the number 10, try to resist changing
    setTimeout(() => { talkVideoStream.playbackRate = playbackSpeed; }, 10);
    
    setTimeout(() => { if (talkVideoStream.paused) playIdleVideo(); }, 500);
    talkVideoStream.style.zIndex = 3;
    
    if (!videoUrl) return;
    talkVideoStream.src = videoUrl;
    talkVideoStream.loop = false;

    // safari hotfix
    if (talkVideo.paused) {
      talkVideo
        .play()
        .then((_) => {})
        .catch((e) => {});
    }
  }

  // talkVideoStream.onloadstart((e) => {
  //   e.target.playbackRate = playbackSpeed;
  // });

  function playIdleVideo() {
    botSpeaking = false;

    talkVideo.classList.remove('item-fade-out');
    talkVideo.classList.add('item-fade');

    talkVideoStream.classList.remove('item-fade');
    talkVideoStream.classList.add('item-fade-out');
    
    // muteButton.classList.add('d-none');
    
    talkVideoStream.style.zIndex = 1;

    talkVideo.srcObject = undefined;
    talkVideo.src = CUSTOM.video;
    talkVideo.loop = true;
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

      talkVideoStream.controls = "";
      talkVideoStream.muted = "";
    } else if (userAgent.indexOf("Firefox") !== -1) {
      talkVideoStream.controls = "";
      talkVideoStream.muted = "";

      browser = "Mozilla Firefox";
    } else if (userAgent.indexOf("Edge") !== -1) {
      browser = "Microsoft Edge";

      talkVideoStream.controls = "";
      talkVideoStream.muted = "";
    } else if (userAgent.indexOf("Safari") !== -1) {
      talkVideoStream.controls = "";
      talkVideoStream.muted = "";

      browser = "Apple Safari";
    } else if (userAgent.indexOf("Opera") !== -1 || userAgent.indexOf("OPR") !== -1) {
      browser = "Opera";
    } else if (userAgent.indexOf("Trident") !== -1) {
      browser = "Internet Explorer";
    }

    return browser;
  }

  function getToken() {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 32; i++)
    {
        result += chars[getRandomInt(16)];
    }
    return result
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

}

loadJSON();

// document.addEventListener('load', () => {

// setTimeout(function() {
//   document.getElementById('speech').value = "שלום";
//   setTimeout(function() {
//     document.getElementById('chat-button').click();
//   }, 100);
// }, 400);





var x, i, j, l, ll, selElmnt, a, b, c;
/* Look for any elements with the class "custom-select": */
x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
  selElmnt = x[i].getElementsByTagName("select")[0];
  ll = selElmnt.length;
  /* For each element, create a new DIV that will act as the selected item: */
  a = document.createElement("span");
  a.setAttribute("class", "select-selected");
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  x[i].appendChild(a);
  /* For each element, create a new DIV that will contain the option list: */
  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");
  for (j = 1; j < ll; j++) {
    /* For each option in the original select element,
    create a new DIV that will act as an option item: */
    c = document.createElement("DIV");
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function(e) {
        /* When an item is clicked, update the original select box,
        and the selected item: */
        var y, i, k, s, h, sl, yl;

        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        sl = s.length;
        h = this.parentNode.previousSibling;
        for (i = 0; i < sl; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = this.innerHTML;

            tool.innerHTML = s.value;
            toolDescription.innerHTML = CUSTOM[s.value + 'Description'];
            // clientId = CUSTOM[s.value.toLowerCase()]
            playbackSpeed = s.value;
            talkVideoStream.playbackRate = s.value;
            // clearChat();
            // applyQuestion();

            y = this.parentNode.getElementsByClassName("same-as-selected");
            yl = y.length;
            for (k = 0; k < yl; k++) {
              y[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }
        h.click();
    });
    b.appendChild(c);
  }
  x[i].appendChild(b);
  a.addEventListener("click", function(e) {
    /* When the select box is clicked, close any other select boxes,
    and open/close the current select box: */
    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");
  });
}

function closeAllSelect(elmnt) {
  /* A function that will close all select boxes in the document,
  except the current select box: */
  var x, y, i, xl, yl, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);

