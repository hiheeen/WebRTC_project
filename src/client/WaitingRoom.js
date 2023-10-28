import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function WaitingRoom() {
  const [roomId, setRoomId] = useState();
  const navigate = useNavigate();
  const enterRoom = () => {
    navigate(`/${roomId}`);
  };
  return (
    <div>
      <div>
        <input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Room Id"
        ></input>
        <button onClick={enterRoom}>입장하기</button>
      </div>
    </div>
  );
}
export default WaitingRoom;
