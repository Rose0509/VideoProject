import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebRTC } from '../context/WebRTCContext';

// A more professional UI component for the video grid
const VideoGrid = ({ localStream, remoteStreams }) => {
  const remoteStreamEntries = Object.entries(remoteStreams);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
      {/* Local Video */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        <video ref={video => { if (video) video.srcObject = localStream; }} className="w-full h-full object-cover transform scale-x-[-1]" autoPlay muted playsInline />
        <p className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">Vous</p>
      </div>

      {/* Remote Videos */}
      {remoteStreamEntries.map(([peerId, stream]) => (
        <div key={peerId} className="relative bg-gray-800 rounded-lg overflow-hidden">
          <video ref={video => { if (video) video.srcObject = stream; }} className="w-full h-full object-cover" autoPlay playsInline />
          <p className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">{peerId}</p>
        </div>
      ))}
    </div>
  );
};

export const CallPage = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  const { myId, sendMessage, registerMessageHandler } = useWebRTC();

  // State for streams and connections
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const peerConnectionsRef = useRef({});

  // UI State
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('Prêt à rejoindre l\'appel.');
  const [isWaiting, setIsWaiting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [joinWithVideo, setJoinWithVideo] = useState(true);
  const [joinWithAudio, setJoinWithAudio] = useState(true);

  // --- Effects ---

  useEffect(() => {
    if (inCall) {
      // If we are in a call but have no peers, we are waiting.
      setIsWaiting(Object.keys(remoteStreams).length === 0);
    } else {
      setIsWaiting(false);
    }
  }, [inCall, remoteStreams]);

  const iceServers = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  };

  // --- WebRTC and Signaling Logic ---

  const createPeerConnection = useCallback((peerId) => {
    if (peerConnectionsRef.current[peerId]) {
      console.warn(`Peer connection for ${peerId} already exists.`);
      return peerConnectionsRef.current[peerId];
    }

    const pc = new RTCPeerConnection(iceServers);
    peerConnectionsRef.current[peerId] = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage({
          type: 'candidate',
          candidate: event.candidate,
          from: myId,
          to: peerId,
          callId,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log(`Track received from ${peerId}`);
      setRemoteStreams(prev => ({ ...prev, [peerId]: event.streams[0] }));
    };

    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    console.log(`Peer connection created for ${peerId}`);
    return pc;
  }, [localStream, myId, callId, sendMessage]);

  const closePeerConnection = useCallback((peerId) => {
    const pc = peerConnectionsRef.current[peerId];
    if (pc) {
      pc.close();
      delete peerConnectionsRef.current[peerId];
    }
    setRemoteStreams(prev => {
      const newStreams = { ...prev };
      delete newStreams[peerId];
      return newStreams;
    });
    console.log(`Peer connection with ${peerId} closed.`);
  }, []);

  const handleMessage = useCallback(async (event) => {
    const message = event; // Already parsed by context

    // Ignore messages not for this call or self-sent messages
    if (message.callId !== callId || message.from === myId) return;

    console.log('Received message:', message);
    const { type, from: peerId } = message;
    
    let pc = peerConnectionsRef.current[peerId];
    if (!pc && (type === 'offer' || type === 'user-joined')) {
      pc = createPeerConnection(peerId);
    }

    try {
      switch (message.type) {
        case 'user-joined':
          // A new user joined, create and send an offer
          console.log(`User ${peerId} joined, sending offer...`);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendMessage({ type: 'offer', sdp: offer.sdp, from: myId, to: peerId, callId });
          break;

        case 'offer':
          console.log(`Offer received from ${peerId}`);
          await pc.setRemoteDescription(new RTCSessionDescription(message));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendMessage({ type: 'answer', sdp: answer.sdp, from: myId, to: peerId, callId });
          setStatusMessage('Appel connecté.');
          break;

        case 'answer':
          console.log(`Answer received from ${peerId}`);
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(message));
          }
          break;

        case 'candidate':
          if (pc && pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
          }
          break;
        
        case 'user-left':
          console.log(`User ${peerId} left the call.`);
          setStatusMessage(`Le correspondant ${peerId} a quitté l'appel.`);
          closePeerConnection(peerId);
          break;

        default:
          console.warn('Unknown message type:', type);
      }
    } catch (err) {
      console.error('Error handling message:', err);
      setError(`Erreur de communication: ${err.message}`);
    }
  }, [callId, myId, sendMessage, createPeerConnection, closePeerConnection]);

  // Register the message handler with the context
  useEffect(() => {
    if (!myId) return;
    const unregister = registerMessageHandler(handleMessage);
    return unregister;
  }, [myId, registerMessageHandler, handleMessage]);

  // --- Call Management ---

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    });
  };


  const handleJoin = async () => {
    if (!myId) {
      setError("Votre ID utilisateur n'est pas encore défini.");
      return;
    }
    setStatusMessage('Démarrage des périphériques...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: joinWithVideo,
        audio: joinWithAudio,
      });
      setLocalStream(stream);
      setInCall(true);
      setStatusMessage('Connexion à l\'appel...');
      
      // Announce joining the room
      sendMessage({ type: 'join', roomId: callId, userId: myId });

    } catch (err) {
      console.error('Failed to get local stream', err);
      setError("Impossible d'accéder à la caméra et au micro.");
      setStatusMessage('Erreur de périphérique.');
    }
  };

  const handleHangUp = () => {
    // Notify others you are leaving
    sendMessage({ type: 'hangup', from: myId, callId });
    
    // Close all peer connections
    Object.keys(peerConnectionsRef.current).forEach(peerId => {
      closePeerConnection(peerId);
    });

    // Stop local media
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setInCall(false);
    setStatusMessage('Appel terminé.');
    navigate('/');
  };

  const toggleMedia = (type) => {
    if (!localStream) return;
    if (type === 'mic') {
        localStream.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
            setIsMicMuted(!track.enabled);
        });
    } else if (type === 'camera') {
        localStream.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
            setIsCameraOff(!track.enabled);
        });
    }
  };

  // --- UI Rendering ---

  return (
    <div className="flex flex-col h-[80vh] w-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Appel en cours</h1>
      <p className="text-sm text-gray-500 mb-4">ID de l'appel: <code className="bg-gray-200 p-1 rounded">{callId}</code></p>

      {statusMessage && <p className="text-sm text-gray-500 mb-4">{statusMessage}</p>}
      {error && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}

      <div className="flex-grow bg-gray-200 rounded-lg p-4">
        {inCall && localStream ? (
          isWaiting ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-700">
              <h2 className="text-2xl font-bold mb-4">En attente de participants...</h2>
              <p className="mb-6">Partagez ce lien pour inviter d'autres personnes à l'appel.</p>
              <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50 w-full max-w-md">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-grow bg-transparent outline-none text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-lg hover:bg-blue-700 transition duration-300 text-sm"
                >
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>
              <div className="mt-8 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-2">Votre aperçu</h3>
                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                  <video ref={video => { if (video) video.srcObject = localStream; }} className="w-full h-full object-cover transform scale-x-[-1]" autoPlay muted playsInline />
                </div>
              </div>
            </div>
          ) : (
            <VideoGrid localStream={localStream} remoteStreams={remoteStreams} />
          )
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Préparez-vous à rejoindre l'appel...</p>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap justify-center items-center gap-4 mt-4">
        {inCall ? (
          <>
            <button
              onClick={() => toggleMedia('mic')}
              className={`p-4 rounded-full shadow-lg transition ${isMicMuted ? 'bg-red-500' : 'bg-gray-600'} text-white`}
              title={isMicMuted ? 'Activer le micro' : 'Couper le micro'}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm-1 3a1 1 0 00-2 0v1a5 5 0 005 5v2.586l-2.293-2.293a1 1 0 10-1.414 1.414L8 16.414V18a1 1 0 102 0v-1.586l2.707-2.707a1 1 0 10-1.414-1.414L11 13.586V8a5 5 5 0 00-5-5H5a1 1 0 000 2h1a3 3 0 013 3v1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => toggleMedia('camera')}
              className={`p-4 rounded-full shadow-lg transition ${isCameraOff ? 'bg-red-500' : 'bg-gray-600'} text-white`}
              title={isCameraOff ? "Activer la caméra" : "Désactiver la caméra"}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M14.5 3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-13a.5.5 0 01-.5-.5v-13a.5.5 0 01.5-.5h13zM14 4H2v12h12V4z"/>
                <path d="M10.5 8.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                <path d="M10.5 4a.5.5 0 00-1 0v1.28a4.5 4.5 0 00-3.5 3.5H5a.5.5 0 000 1h1.28a4.5 4.5 0 003.5 3.5V14a.5.5 0 001 0v-1.28a4.5 4.5 0 003.5-3.5H16a.5.5 0 000-1h-1.28a4.5 4.5 0 00-3.5-3.5V4z"/>
              </svg>
            </button>
            <button
              onClick={handleHangUp}
              className="p-4 rounded-full shadow-lg bg-red-600 text-white hover:bg-red-700 transition"
              title="Raccrocher"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.707 13.293a1 1 0 01-1.414 0L13 10.414l-3.293 3.293a1 1 0 01-1.414-1.414L11.586 9 8.293 5.707a1 1 0 011.414-1.414L13 7.586l3.293-3.293a1 1 0 011.414 1.414L14.414 9l3.293 3.293a1 1 0 010 1.414z"/>
              </svg>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 p-6 border rounded-lg bg-white shadow-lg w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-800">Paramètres de l'appel</h3>
            <div className="flex gap-6 my-4">
              <label className="flex items-center gap-2 cursor-pointer text-gray-700 font-medium">
                <input
                  type="checkbox"
                  checked={joinWithVideo}
                  onChange={e => setJoinWithVideo(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Caméra
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-gray-700 font-medium">
                <input
                  type="checkbox"
                  checked={joinWithAudio}
                  onChange={e => setJoinWithAudio(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Micro
              </label>
            </div>
            <button
              onClick={handleJoin}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition duration-300"
            >
              Rejoindre l'appel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallPage;
