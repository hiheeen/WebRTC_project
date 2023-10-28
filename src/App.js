import logo from './logo.svg';
import './App.css';
import VideoCall from './client/VideoCall';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import WaitingRoom from './client/WaitingRoom';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<WaitingRoom />} />
          <Route path="/:roomName" element={<VideoCall />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
