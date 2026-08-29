import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, X } from 'lucide-react';
import videoService from '../../services/videoService';

const VideoGallery = ({ 
  localStream, 
  remoteStreams, 
  currentUser,
  onToggleAudio,
  onToggleVideo,
  isAudioEnabled,
  isVideoEnabled,
  onMinimize,
  participantsData = {} 
}) => {
  const localVideoRef = useRef(null);

  // Set local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Get user info from participantsData
  const getParticipantInfo = (peerId) => {
    return participantsData[peerId] || { name: 'User', profilePicture: null };
  };

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const allVideos = remoteStreams.length + 1; // +1 for local video
  const gridClass = 
    allVideos === 1
      ? 'grid-cols-1'
      : allVideos <= 2
      ? 'grid-cols-2'
      : allVideos <= 4
      ? 'grid-cols-2'
      : 'grid-cols-3';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-white text-lg font-semibold">Video Call</h2>
        <button
          onClick={onMinimize}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className={`grid ${gridClass} gap-4 h-full`}>
          {/* Local Video */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video group">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Local user label */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              {currentUser?.profilePicture ? (
                <img
                  src={currentUser.profilePicture}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full border border-white"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center border border-white text-xs font-bold text-white">
                  {getUserInitials(currentUser?.name || 'You')}
                </div>
              )}
              <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                You
              </span>
            </div>

            {/* Status indicators */}
            <div className="absolute top-3 right-3 flex gap-2">
              {isAudioEnabled ? (
                <Mic size={18} className="text-green-400" />
              ) : (
                <MicOff size={18} className="text-red-400" />
              )}
              {isVideoEnabled ? (
                <Video size={18} className="text-green-400" />
              ) : (
                <VideoOff size={18} className="text-red-400" />
              )}
            </div>
          </div>

          {/* Remote Videos */}
          {remoteStreams.map(({ peerId, stream }) => {
            const participant = getParticipantInfo(peerId);
            return (
              <RemoteVideo
                key={peerId}
                peerId={peerId}
                stream={stream}
                participantName={participant.name}
                profilePicture={participant.profilePicture}
                getUserInitials={getUserInitials}
              />
            );
          })}
        </div>
      </div>

      {/* Controls Footer */}
      <div className="flex justify-center items-center gap-4 p-4 border-t border-gray-700 bg-gray-900">
        <button
          onClick={() => onToggleAudio(!isAudioEnabled)}
          className={`p-3 rounded-full transition-colors ${
            isAudioEnabled
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button
          onClick={() => onToggleVideo(!isVideoEnabled)}
          className={`p-3 rounded-full transition-colors ${
            isVideoEnabled
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
      </div>
    </div>
  );
};

// Remote Video Component
const RemoteVideo = ({ peerId, stream, participantName, profilePicture, getUserInitials }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video group">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Participant label */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        {profilePicture ? (
          <img
            src={profilePicture}
            alt={participantName}
            className="w-8 h-8 rounded-full border border-white"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center border border-white text-xs font-bold text-white">
            {getUserInitials(participantName || 'User')}
          </div>
        )}
        <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
          {participantName || 'User'}
        </span>
      </div>
    </div>
  );
};

export default VideoGallery;
