import React, { useState , useEffect } from 'react'
import Video from './Video'

function Videos({remoteStreamsP}){

  var [rVideos, setRVideos] = useState([])
  var [remoteStreams, setRemotesStreams] = useState([])
  
  useEffect(() => {

    console.log('remoteStreams Videos: ', remoteStreamsP)

    if (remoteStreams !== remoteStreamsP) {
      let _rVideos = remoteStreamsP.map((rVideos, index) => {
        let video = <Video 
          videoStream={rVideos.stream}
        />
        return(
          <div>
            {video}
          </div>
        )
      })
      setRemotesStreams(remoteStreamsP)
      setRVideos(_rVideos)
    }
  }, [])

  return(
    <div>
      {rVideos} 
    </div>
  )
}

export default Videos
