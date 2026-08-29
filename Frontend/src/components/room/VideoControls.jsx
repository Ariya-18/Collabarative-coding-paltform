import React from 'react';
import { Video, VideoOff, Phone, PhoneOff } from 'lucide-react';

const VideoControls = ({ 
  isVideoCallActive, 
  onToggleVideoCall, 
  isConnecting = false 
}) => {
  return (
    <div className="flex items-center gap-2">
      {isVideoCallActive ? (
        <button
          onClick={() => onToggleVideoCall(false)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          disabled={isConnecting}
          title="End video call"
        >
          <PhoneOff size={18} />
          <span className="hidden sm:inline text-sm font-medium">End Call</span>
        </button>
      ) : (
        <button
          onClick={() => onToggleVideoCall(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          disabled={isConnecting}
          title="Start video call"
        >
          <Video size={18} />
          <span className="hidden sm:inline text-sm font-medium">Start Call</span>
        </button>
      )}
    </div>
  );
};

export default VideoControls;
