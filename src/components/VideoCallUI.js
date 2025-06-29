import React from 'react';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff } from 'react-icons/fi';

const VideoCallUI = ({
  localVideoRef,
  remoteVideoRef,
  onHangUp,
  onToggleMute,
  onToggleCamera,
  isMuted,
  isCameraOff,
}) => {
  return (
    <div className="relative w-full h-screen bg-gray-900 flex items-center justify-center text-white font-sans">
      <div className="w-full h-full relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 w-24 h-18 bg-black rounded-md shadow-md overflow-hidden border border-gray-700">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-center bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-full transition-colors duration-200 ${
              isMuted ? 'bg-red-500 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
            }`}
            aria-label={isMuted ? 'Activer le micro' : 'Couper le micro'}
          >
            {isMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
          </button>

          <button
            onClick={onToggleCamera}
            className={`p-2 rounded-full transition-colors duration-200 ${
              isCameraOff ? 'bg-red-500 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
            }`}
            aria-label={isCameraOff ? 'Activer la caméra' : 'Désactiver la caméra'}
          >
            {isCameraOff ? <FiVideoOff size={20} /> : <FiVideo size={20} />}
          </button>

          <button
            onClick={onHangUp}
            className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
            aria-label="Quitter l'appel"
          >
            <FiPhoneOff size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallUI;