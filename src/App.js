import logo from './logo.svg';
import './App.css';

function App() {
  
  var stream = null;

  navigator.mediaDevice?.getUserMedia({video: true})
  .then(v => stream = v)
  .catch(console.error)

  return (
    <div className="App">
      <div>Stream:</div>
      <video ref={stream} autoPlay></video>
    </div>
  );
}

export default App;
