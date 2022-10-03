import React, { useState, useRef, useEffect } from 'react'

function Video({videoStream, id, muted}) {
  
  var video = useRef({});

  useEffect(() => {
    if (videoStream) {
      video.current.srcObject = videoStream
    }
  }, [videoStream])

  return(
    <div>
      <video ref={video} autoPlay></video>
    </div>
  )
}

export default Video;
