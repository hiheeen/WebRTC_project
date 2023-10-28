import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

const VideoCall = () => {
  // 소켓정보를 담을 Ref
  const socketRef = useRef();
  // 자신의 비디오
  const myVideoRef = useRef(null);
  // 다른사람의 비디오
  const remoteVideoRef = useRef(null);
  // peerConnection => STUN 서버
  const peerRef = useRef();

  // 저는 특정 화면에서 방으로 진입시에 해당 방의 방번호를 url parameter로 전달해주었습니다.
  const { roomName } = useParams();

  useEffect(() => {
    socketRef.current = io('localhost:8080');

    peerRef.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
      ],
    });
    // 기존 유저가 있고, 새로운 유저가 들어왔다면 오퍼생성 => 'all_users'이벤트 듣고 createOffer함수 실행
    socketRef.current.on('all_users', (allUsers) => {
      if (allUsers.length > 0) {
        createOffer();
      }
    });
    // offer를 전달받은 PeerB만 해당됩니다
    // offer를 들고 만들어둔 answer 함수 실행
    socketRef.current.on('getOffer', (sdp) => {
      console.log('recv Offer');
      createAnswer(sdp); // peerB 클라이언트가 전달받은 sdp로 answer생성
    });
    // answer를 전달받을 PeerA만 해당됩니다.
    // answer를 전달받아 PeerA의 RemoteDescription에 등록
    socketRef.current.on('getAnswer', (sdp) => {
      console.log('recv Answer');
      if (!peerRef.current) {
        return;
      }
      peerRef.current.setRemoteDescription(sdp);
    });

    // 서로의 candidate를 전달받아 등록
    socketRef.current.on('getCandidate', async (candidate) => {
      if (!peerRef.current) {
        console.log('peerRef 없음?');
        return;
      }
      console.log('candidate 실행'); // 이 콘솔이 찍히면 연결됨
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('Error adding received ice candidate', e);
      }
    });
    getMedia(); // 이 위치에서 작동 성공
    // 마운트시 해당 방의 roomName을 서버에 전달
    socketRef.current.emit('join_room', {
      room: roomName,
    });

    // 언마운트시 socket disconnect
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (peerRef.current) {
        peerRef.current.close();
      }
    };
  }, []);

  const getMedia = async () => {
    try {
      // 자신이 원하는 자신의 스트림정보
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
      }
      if (!(peerRef.current && socketRef.current)) {
        console.log('연결된 Peer 또는 Socket이 없습니다.');
      }
      // 스트림을 peerConnection에 등록
      stream.getTracks().forEach((track) => {
        if (!peerRef.current) {
          return;
        }
        peerRef.current.addTrack(track, stream);
      });

      // iceCandidate 이벤트
      peerRef.current.onicecandidate = (e) => {
        if (e.candidate) {
          if (!socketRef.current) {
            return;
          }
          console.log('recv candidate');
          socketRef.current.emit('candidate', e.candidate, roomName);
        } else if (!e.candidate) {
          console.log('candidate 없음', e.candidate);
        }
      };

      // 구 addStream 현 track 이벤트
      peerRef.current.ontrack = (e) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = e.streams[0];
        }
      };
      socketRef.current.emit('join_room', {
        roomName: roomName,
      });
    } catch (e) {
      console.error(e);
    }
  };
  const createOffer = async () => {
    console.log('create Offer');
    if (!(peerRef.current && socketRef.current)) {
      return;
    }
    try {
      // offer 생성
      const sdp = await peerRef.current.createOffer();
      // 자신의 sdp로 LocalDescription 설정
      peerRef.current.setLocalDescription(sdp);
      console.log('sent the offer');
      // offer 전달
      socketRef.current.emit('offer', sdp, roomName); // 서버에 offer이벤트 알려줌
      console.log(roomName);
    } catch (e) {
      console.error(e);
    }
  };

  const createAnswer = async (sdp) => {
    // sdp : PeerA에게서 전달받은 offer

    console.log('createAnswer');
    if (!(peerRef.current && socketRef.current)) {
      console.log('peerRef or socketRef none');
      return;
    }

    try {
      // PeerA가 전달해준 offer를 RemoteDescription에 등록해 줍시다.
      peerRef.current.setRemoteDescription(sdp);

      // answer생성해주고
      const answerSdp = await peerRef.current.createAnswer();

      // answer를 LocalDescription에 등록해 줍니다. (PeerB 기준)
      peerRef.current.setLocalDescription(answerSdp);
      console.log('sent the answer');
      socketRef.current.emit('answer', answerSdp, roomName);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <video
        id="remotevideo"
        style={{
          width: 240,
          height: 240,
          backgroundColor: 'black',
        }}
        ref={myVideoRef}
        autoPlay
      />
      <video
        id="remotevideo"
        style={{
          width: 240,
          height: 240,
          backgroundColor: 'rgba(120, 120, 120, 0.3)',
        }}
        ref={remoteVideoRef}
        autoPlay
      />
    </div>
  );
};

export default VideoCall;
