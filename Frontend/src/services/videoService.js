import Peer from 'peerjs';
import toast from 'react-hot-toast';

class VideoService {
  constructor() {
    this.peer = null;
    this.localStream = null;
    this.remoteStreams = {}; // { peerId: { stream, connection } }
    this.peerConnections = {};
    this.callbacks = {
      onRemoteStream: null,
      onRemoteStreamRemoved: null,
      onError: null,
      onConnectionOpen: null,
    };
    this.isAudioEnabled = true;
    this.isVideoEnabled = true;
  }

  /**
   * Initialize PeerJS with unique ID
   */
  async initializePeer(userId, socketId) {
    return new Promise((resolve, reject) => {
      try {
        // Create unique peer ID combining user ID and socket ID for uniqueness
        const peerId = `${userId}-${socketId}-${Date.now()}`;
        
        this.peer = new Peer(peerId, {
          host: 'peerserver.codeshare.local', // Will fallback to PeerJS cloud
          port: 9000,
          path: '/',
          secure: false,
          config: {
            iceServers: [
              { urls: ['stun:stun.l.google.com:19302'] },
              { urls: ['stun:stun1.l.google.com:19302'] },
              { urls: ['stun:stun2.l.google.com:19302'] },
            ],
          },
        }).on('error', (error) => {
          console.warn('Peer initialization warning, using cloud:', error);
          // Fallback to cloud server
          if (!this.peer) {
            this.peer = new Peer(`${userId}-${socketId}-${Date.now()}`, {
              config: {
                iceServers: [
                  { urls: ['stun:stun.l.google.com:19302'] },
                  { urls: ['stun:stun1.l.google.com:19302'] },
                  { urls: ['stun:stun2.l.google.com:19302'] },
                ],
              },
            });
            this.setupPeerHandlers();
            resolve(this.peer.id);
          }
        });

        this.setupPeerHandlers();
        resolve(this.peer.id);
      } catch (error) {
        console.error('Failed to initialize peer:', error);
        reject(error);
      }
    });
  }

  /**
   * Setup PeerJS event handlers
   */
  setupPeerHandlers() {
    if (!this.peer) return;

    this.peer.on('call', (call) => {
      console.log('Received call from:', call.peer);
      if (this.localStream) {
        call.answer(this.localStream);
        call.on('stream', (remoteStream) => {
          this.handleRemoteStream(call.peer, remoteStream, call);
        });
      }
    });

    this.peer.on('connection', (conn) => {
      console.log('Peer connection established:', conn.peer);
      conn.on('open', () => {
        if (this.callbacks.onConnectionOpen) {
          this.callbacks.onConnectionOpen(conn.peer);
        }
      });
      conn.on('error', (error) => {
        console.error('Connection error:', error);
      });
    });

    this.peer.on('error', (error) => {
      console.error('Peer error:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    });
  }

  /**
   * Get user media (audio & video)
   */
  async getLocalStream(constraints = { audio: true, video: { width: 1280, height: 720 } }) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error('Failed to get media stream:', error);
      toast.error('Cannot access camera/microphone. Check permissions.');
      throw error;
    }
  }

  /**
   * Call a remote peer
   */
  async callPeer(remotePeerId) {
    if (!this.peer || !this.localStream) {
      console.error('Peer not initialized or no local stream');
      return null;
    }

    try {
      const call = this.peer.call(remotePeerId, this.localStream);
      
      call.on('stream', (remoteStream) => {
        this.handleRemoteStream(remotePeerId, remoteStream, call);
      });

      call.on('error', (error) => {
        console.error(`Error calling ${remotePeerId}:`, error);
        this.handleRemoteStreamRemoved(remotePeerId);
      });

      call.on('close', () => {
        console.log(`Call with ${remotePeerId} closed`);
        this.handleRemoteStreamRemoved(remotePeerId);
      });

      this.peerConnections[remotePeerId] = call;
      return call;
    } catch (error) {
      console.error('Failed to call peer:', error);
      throw error;
    }
  }

  /**
   * Handle incoming remote stream
   */
  handleRemoteStream(peerId, stream, call) {
    console.log('Received remote stream from:', peerId);
    this.remoteStreams[peerId] = { stream, call };
    
    if (this.callbacks.onRemoteStream) {
      this.callbacks.onRemoteStream(peerId, stream);
    }
  }

  /**
   * Handle remote stream removal
   */
  handleRemoteStreamRemoved(peerId) {
    console.log('Remote stream removed:', peerId);
    delete this.remoteStreams[peerId];
    delete this.peerConnections[peerId];
    
    if (this.callbacks.onRemoteStreamRemoved) {
      this.callbacks.onRemoteStreamRemoved(peerId);
    }
  }

  /**
   * Toggle audio
   */
  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
      this.isAudioEnabled = enabled;
      return enabled;
    }
    return false;
  }

  /**
   * Toggle video
   */
  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
      this.isVideoEnabled = enabled;
      return enabled;
    }
    return false;
  }

  /**
   * Get local audio enabled state
   */
  getAudioEnabled() {
    return this.isAudioEnabled;
  }

  /**
   * Get local video enabled state
   */
  getVideoEnabled() {
    return this.isVideoEnabled;
  }

  /**
   * Register callback
   */
  onRemoteStream(callback) {
    this.callbacks.onRemoteStream = callback;
  }

  onRemoteStreamRemoved(callback) {
    this.callbacks.onRemoteStreamRemoved = callback;
  }

  onError(callback) {
    this.callbacks.onError = callback;
  }

  onConnectionOpen(callback) {
    this.callbacks.onConnectionOpen = callback;
  }

  /**
   * Stop all streams and close peer
   */
  stopAll() {
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Close all remote connections
    Object.values(this.peerConnections).forEach((conn) => {
      conn.close();
    });
    this.peerConnections = {};
    this.remoteStreams = {};

    // Close peer
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }

  /**
   * Get peer ID
   */
  getPeerId() {
    return this.peer?.id || null;
  }

  /**
   * Get remote streams
   */
  getRemoteStreams() {
    return Object.entries(this.remoteStreams).map(([peerId, { stream }]) => ({
      peerId,
      stream,
    }));
  }
}

export default new VideoService();
