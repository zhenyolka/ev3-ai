//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; //audio context to help us record

var recordButton = document.getElementById("recordButton");
var recordButtonIsActive = false;

//add events to those 2 buttons
recordButton.addEventListener("click", recordButtonClicked);

function recordButtonClicked() {
    if(recordButtonIsActive) {
        recordButtonIsActive = false;
        
        rec.stop();
        
        gumStream.getAudioTracks()[0].stop();
        
        rec.exportWAV(upload);
    } else {
        var constraints = { audio: true, video: false };
        
        recordButtonIsActive = true;
        
        navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
            audioContext = new AudioContext();
            
            gumStream = stream;
            
            input = audioContext.createMediaStreamSource(stream);
            rec = new Recorder(input,{numChannels:1});
            rec.record();
            
        }).catch(function(err) {
            //TODO enable button
            alert("Can't use microphone");
        });
    }  
}

function upload(blob) {
    
    var filename = new Date().toISOString();
    
    var xhr=new XMLHttpRequest();
    xhr.onload=function(e) {
        if(this.readyState === 4) {
            console.log("Server returned: ",e.target.responseText);
        }
    };
    
    var fd= new FormData();
    fd.append("audio_data",blob, filename);
    xhr.open("POST","upload.php",true);
    xhr.send(fd);
}