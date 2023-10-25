import { useRef } from "react";
import { useParams } from "react-router-dom";
import { Socket } from "socket.io-client";

const VideoCall = () => {
  // 소켓정보를 담을 Ref
  const socketRef = useRef();
  // 자신의 비디오
  const myVideoRef = useRef(null);
  // 다른사람의 비디오
  const remoteVideoRef = useRef(null);
  // peerConnection
  const peerRef = useRef();
  
  // 저는 특정 화면에서 방으로 진입시에 해당 방의 방번호를 url parameter로 전달해주었습니다.
  const {roomName} = useParams();
  
  useEffect(() => {
    // 소켓 연결
    socketRef.current = io("localhost:3000");
    
    // peerConnection 생성
    // iceServers는 stun sever설정이며 google의 public stun server를 사용하였습니다.
    peerRef.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });
  }, [])

  return (
    <div>
      <video ref={myVideoRef} autoPlay />
      <video ref={remoteVideoRef} autoPlay />
    </div>
  );
};

export default VideoCall;