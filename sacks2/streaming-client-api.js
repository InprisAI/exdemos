<!DOCTYPE html>  
<html class="w-100 h-100">  
  <head>  
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">  
    <title>Yosef ben Azaria</title>  
    <!-- added google fonts -->  
    <link rel="preconnect" href="https://fonts.googleapis.com" />  
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />  
    <link  
      href="https://fonts.googleapis.com/css2?family=Mulish:wght@300;400;700&display=swap"  
      rel="stylesheet"  
    />  
    <link href="../css/all.min.css" rel="stylesheet">  
  
    <link rel="preconnect" href="https://fonts.googleapis.com">  
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>  
    <link rel="preconnect" href="https://fonts.googleapis.com">  
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>  
    <link rel="icon" href="../favicon.png" />  
  
    <link href="https://fonts.googleapis.com/css2?family=Jura:wght@600;700&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">  
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">  
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" crossorigin="anonymous"></script>  
    <style>  
      * {  
        direction: ltr;  
      }  
  
      .peerConnectionState-new {  
        color: cornflowerblue;  
      }  
      .peerConnectionState-connecting {  
        color: orange;  
      }  
      .peerConnectionState-connected {  
        color: green;  
      }  
      .peerConnectionState-disconnected,  
      .peerConnectionState-closed,  
      .peerConnectionState-failed {  
        color: red;  
      }  
  
      .iceConnectionState-new {  
        color: cornflowerblue;  
      }  
      .iceConnectionState-checking {  
        color: orange;  
      }  
      .iceConnectionState-connected,  
      .iceConnectionState-completed {  
        color: green;  
      }  
      .peerConnectionState-disconnected,  
      .peerConnectionState-closed,  
      .peerConnectionState-failed {  
        color: red;  
      }  
  
      .iceGatheringState-new {  
        color: cornflowerblue;  
      }  
      .iceGatheringState-gathering {  
        color: orange;  
      }  
      .iceGatheringState-complete {  
        color: black;  
      }  
  
      .signalingState-stable {  
        color: green;  
      }  
      .signalingState-have-local-offer,  
      .signalingState-have-remote-offer,  
      .signalingState-have-local-pranswer,  
      .signalingState-have-remote-pranswer {  
        color: cornflowerblue;  
      }  
      .signalingState-closed {  
        color: red;  
      }  
  
      .streamingState-streaming {  
        color: green;  
      }  
  
      .streamingState-empty {  
        color: grey;  
      }  
  
      /* added csss from here */  
  
      body * {  
        font-family: 'Roboto', sans-serif;  
        /* text-align: center; */  
        outline: none;  
      }  
  
      #content {  
        /* width: 820px;  
        position: relative;  
        margin: 0 auto; */  
      }  
  
      #buttons {  
        clear: both;  
        padding: 0 0 0 0;  
        text-align: center;  
      }  
  
      button {  
        padding: 10px 30px;  
        border-radius: 5px;  
        border: none;  
        font-size: 17px;  
        margin: 0 5px;  
        background-color: #14C6F1;  
        color: #fff;  
      }  
  
      button:hover {  
        background-color: #14C6F1;  
        cursor: pointer;  
        transition: all 0.2s ease-out;  
      }  
  
      #status {  
        clear: both;  
        padding: 20px 0 0 0;  
        text-align: left;  
        display: inline-block;  
        zoom: 1;  
        line-height: 140%;  
        font-size: 15px;  
      }  
  
      #status div {  
        padding-bottom: 10px;  
      }  
  
      #video-wrapper {  
        /* background: url(bg.png); */  
        height: 270px;  
        background-position: top;  
      }  
  
      #video-wrapper div#help-message {  
        width: 400px;  
        margin: 0 auto;  
        padding: 50px 0 0 0;  
      }  
      video {  
        display: block;  
        /*border:1px solid;*/  
        border-radius: 5px;  
        background-color: #000;  
      }  
  
      #speech {  
        min-width: 80%;  
        padding-left: 10px;  
        padding-right: 10px;  
        margin-left: 5px;  
        margin-right: 5px;  
      }  
  
      .item-fade {  
        position: absolute;  
        display: block;  
        z-index: 2;  
        opacity: 1;  
        transition: opacity .5s ease-in-out 0s;  
      }  
  
      .item-fade-out {  
        position: absolute;  
        display: block;  
        z-index: 1;  
        opacity: 0;  
        transition: opacity .5s ease-in-out 0s;  
      }  
  
      .radial-gradient {  
        background: transparent radial-gradient(closest-side at 50% 50%, #204885 0%, #20488500 100%) 0% 0% no-repeat padding-box;  
      }  
  
      .humains-title {  
        text-align: left;  
        font: normal normal bold 40px/33px Jura;  
        letter-spacing: 0px;  
        color: #FFFFFF;  
        text-transform: uppercase;  
      }  
  
      #help-message-inner::-webkit-scrollbar {  
        width: 12px; /* Increased scrollbar width */  
        background-color: #CFCFCF;  
      }  
  
      #help-message-inner::-webkit-scrollbar-thumb {  
        background-color: #14C6F1;  
        border-radius: 3px;  
      }  
  
      #help-message-inner::-webkit-scrollbar-track {  
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);  
        background-color: #CFCFCF;  
      }  
  
      /* Add Media Query for Mobile View */  
      @media (max-width: 991px) {  
        /* Remove the header for mobile view */  
        header {  
          display: none;  
        }  
  
        /* Apply mobile container styles */  
        .row {  
          height: 100%;  
        }  
  
        /* Adjust the video-wrapper and help-message columns to take full width */  
        .row > .col-xs-12 {  
          flex: 0 0 100%;  
          max-width: 100%;  
        }  
  
        /* Adjust the video-wrapper height for better visibility and center the video */  
        #video-wrapper {  
          height: 60%; /* Changed height percentage */  
          margin-bottom: 20px;  
          margin: 0 auto;  
        }  
  
        /* Adjust the help-message height to fill the remaining space */  
        #help-message {  
          height: 40%; /* Changed height percentage */  
        }  
  
        /* Set video width and height to fill the video-wrapper */  
        video {  
          width: 100%;  
          height: 100%;  
        }  
  
        /* Adjust the chat input area to be centered and full width */  
        .d-flex {  
          flex-direction: column;  
          align-items: center;  
        }  
  
        #speech {  
          margin-bottom: 10px;  
          width: 100%;  
          font-size: 16px; /* Increased font size */  
        }  
  
        /* Adjust button style */  
        #chat-button {  
          width: 100%;  
        }  
  
        /* Increase the size of the send icon and microphone icon */  
        .fa-microphone, .paper-plane {  
          font-size: 20px; /* Increased icon size */  
        }  
  
        /* Adjust chat messages width, alignment and font size */  
        #help-message-inner p {  
          width: 90%;  
          font-size: 16px; /* Increased font size */  
        }  
        #help-message-inner p[style*="color: #14C6F1;"] {  
          text-align: right;  
        }  
      }  
    </style>  
  </head>  
  
  <body class="bg-black w-100 h-100">  
    <div class="container w-100 h-100">  
      <header class="pt-4">  
        <div class="row text-white">  
          <div class="col">  
            <img src="../images/logo.svg" alt="logo" />  
          </div>  
          <div class="col offset-md-5">Home</div>  
          <div class="col">About</div>  
          <div class="col">Places</div>  
          <div class="col">Careers</div>  
          <div class="col">Blog</div>  
        </div>  
      </header>  
      <div class="row mobile-container" style="height: calc(100% - 100px);">  
        <div class="d-flex justify-content-center align-items-center w-100 h-100">  
          <div  
            class="col d-flex justify-content-center"  
            style="background: transparent radial-gradient(closest-side at 50% 50%, #204885 0%, #20488500 100%) 0% 0% no-repeat padding-box;"  
          >  
            <div class="w-100">  
              <div class="humains-title mb-3">  
                HUMAINS  
                <img src="../images/powered.svg" alt="powered by" class="mb-2" />  
              </div>  
              <div  
                id="content"  
              >  
              <!-- added "id=content" -->  
              <div class="row">  
                <div class="col-12">  
                  <!-- added "id=video-wrapper" -->  
                  <div id="video-wrapper" class="video-wrapper">  
                    <video id="talk-video" playsinline autoplay muted loop></video>  
                    <video id="talk-video-stream" playsinline autoplay loop></video>  
                  </div>  
                </div>  
                <div class="col-12">  
                  <div  
                    id="help-message"  
                    class="d-flex flex-column"  
                  >  
                    <div id="help-message-inner" class="p-2 w-100 d-flex flex-column" style="overflow-y: scroll; background-color: #fff; height: 255px;  border-radius: 5px;">  
                      <p style="color: #14C6F1; width: 75%;">Send me a message or press on the microphone to speak</p>  
                    </div>  
                  </div>  
                </div>  
              </div>  
                <div class="d-flex">  
                  <span>  
                    <img src="../images/profile.svg" alt="profile" style="width: 45px; border-radius: 50%;" />  
                  </span>  
                  <input id="speech" class="flex-grow-1" type="text" style="border-radius: 20px; height: 45px;"/>  
                  <button  
                    id="chat-button"  
                    class="m-0 p-0"  
                    type="button"  
                    style="border: thin solid white; border-radius: 20px; height: 45px; width: 90px; background-color: transparent;">  
                    <i class="fa-solid fa-microphone"></i>  
                    <span class="paper-plane" style="display: none">Send</span>  
                  </button>  
                </div>  
              </div>  
            </div>  
          </div>  
        </div>  
      </div>  
    </div>  
    <script type="module" src="./index.js"></script>  
  </body>  
</html>  
