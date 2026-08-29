import axios from 'axios';
import socket from './socket';

class SessionRecorder {
  constructor() {
    this.isRecording = false;
    this.recordingId = null;
    this.sessionStartTime = null;
    this.events = [];
  }

  /**
   * Start recording session
   */
  async startRecording(roomId, room, user) {
    try {
      if (this.isRecording) {
        console.warn('Recording already in progress');
        return;
      }

      // Create recording via API
      const response = await axios.post('/api/recordings/start', {
        roomId,
        title: `${room.title || 'Untitled'} Recording`,
      });

      this.recordingId = response.data._id;
      this.sessionStartTime = Date.now();
      this.isRecording = true;
      this.events = [];

      // Notify backend via socket
      socket.emit('start-recording', {
        roomId,
        user: { id: user._id, name: user.name, profilePicture: user.profilePicture },
        recordingId: this.recordingId,
        room,
      });

      console.log('Recording started:', this.recordingId);
      return this.recordingId;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording session
   */
  async stopRecording(roomId, user) {
    try {
      if (!this.isRecording || !this.recordingId) {
        console.warn('No active recording');
        return;
      }

      // Notify backend via socket
      socket.emit('stop-recording', {
        roomId,
        user: { id: user._id, name: user.name, profilePicture: user.profilePicture },
      });

      // Finalize recording via API
      const response = await axios.post(
        `/api/recordings/${this.recordingId}/finalize`,
        {}
      );

      this.isRecording = false;
      console.log('Recording stopped:', this.recordingId);
      return response.data;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  /**
   * Get active recording ID
   */
  getRecordingId() {
    return this.recordingId;
  }

  /**
   * Get recording status
   */
  isActive() {
    return this.isRecording;
  }

  /**
   * Get session start time
   */
  getSessionStartTime() {
    return this.sessionStartTime;
  }

  /**
   * Clear state
   */
  reset() {
    this.isRecording = false;
    this.recordingId = null;
    this.sessionStartTime = null;
    this.events = [];
  }
}

export default new SessionRecorder();
