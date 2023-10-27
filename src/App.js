import logo from './logo.svg';
import './App.css';
import VideoCall from './client/VideoCall';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
     <div className="App">
    <Routes>
   
      <Route path="/:roomName" element={<VideoCall/>}>
     
      </Route>
    
    </Routes></div>
    </BrowserRouter>
  );
}

export default App;
