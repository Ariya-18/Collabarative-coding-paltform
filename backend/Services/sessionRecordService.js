const SessionRecord = require('../models/SessionRecord');
const crypto = require('crypto');

class SessionRecordService {
  /**
   * Start a new session recording
   */
  async startRecording(roomId, room, user) {
    try {
      const sessionRecord = await SessionRecord.create({
        roomId: roomId.toUpperCase(),
        room: room?._id,
        title: `${room?.title || 'Untitled Room'} - ${new Date().toLocaleString()}`,
        initialCode: room?.code || '',
        initialLanguage: room?.language || 'javascript',
        participants: [
          {
            userId: user._id,
            name: user.name,
            profilePicture: user.profilePicture,
          },
        ],
        events: [],
      });

      return sessionRecord;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Add event to recording
   */
  async addEvent(recordingId, eventData) {
    try {
      const event = {
        ...eventData,
        timestamp: Date.now() - (eventData.sessionStartTime || 0), // Relative timestamp
      };

      const updated = await SessionRecord.findByIdAndUpdate(
        recordingId,
        {
          $push: { events: event },
          $inc: {
            totalCodeChanges: eventData.type === 'code-change' ? 1 : 0,
            totalExecutions: eventData.type === 'execution' ? 1 : 0,
            totalMessages: eventData.type === 'message' ? 1 : 0,
          },
        },
        { new: true }
      );

      return updated;
    } catch (error) {
      console.error('Failed to add event:', error);
      throw error;
    }
  }

  /**
   * Add participant to recording
   */
  async addParticipant(recordingId, user) {
    try {
      const updated = await SessionRecord.findByIdAndUpdate(
        recordingId,
        {
          $addToSet: {
            participants: {
              userId: user._id,
              name: user.name,
              profilePicture: user.profilePicture,
            },
          },
        },
        { new: true }
      );

      return updated;
    } catch (error) {
      console.error('Failed to add participant:', error);
      throw error;
    }
  }

  /**
   * End recording
   */
  async endRecording(recordingId) {
    try {
      const now = new Date();
      const updated = await SessionRecord.findByIdAndUpdate(
        recordingId,
        {
          endTime: now,
          duration: now - new Date(this.recordingStartTime),
        },
        { new: true }
      );

      return updated;
    } catch (error) {
      console.error('Failed to end recording:', error);
      throw error;
    }
  }

  /**
   * Get recording by ID
   */
  async getRecording(recordingId) {
    try {
      const recording = await SessionRecord.findById(recordingId)
        .populate('participants.userId', 'name email profilePicture')
        .populate('room', 'title');

      return recording;
    } catch (error) {
      console.error('Failed to get recording:', error);
      throw error;
    }
  }

  /**
   * Get all recordings for a room
   */
  async getRoomRecordings(roomId, limit = 10) {
    try {
      const recordings = await SessionRecord.find({
        roomId: roomId.toUpperCase(),
      })
        .populate('participants.userId', 'name email profilePicture')
        .sort({ createdAt: -1 })
        .limit(limit);

      return recordings;
    } catch (error) {
      console.error('Failed to get room recordings:', error);
      throw error;
    }
  }

  /**
   * Generate shareable link
   */
  async generateShareToken(recordingId) {
    try {
      const token = crypto.randomBytes(16).toString('hex');

      const updated = await SessionRecord.findByIdAndUpdate(
        recordingId,
        {
          shareToken: token,
          isPublic: true,
        },
        { new: true }
      );

      return updated;
    } catch (error) {
      console.error('Failed to generate share token:', error);
      throw error;
    }
  }

  /**
   * Get recording by share token
   */
  async getRecordingByToken(token) {
    try {
      const recording = await SessionRecord.findOne({ shareToken: token })
        .populate('participants.userId', 'name email profilePicture')
        .populate('room', 'title');

      if (!recording) {
        throw new Error('Recording not found');
      }

      return recording;
    } catch (error) {
      console.error('Failed to get recording by token:', error);
      throw error;
    }
  }

  /**
   * Get event at specific timestamp
   */
  async getEventAtTimestamp(recordingId, timestamp) {
    try {
      const recording = await SessionRecord.findById(recordingId);

      if (!recording) {
        throw new Error('Recording not found');
      }

      // Find the latest event at or before the given timestamp
      const event = recording.events
        .filter((e) => e.timestamp <= timestamp)
        .sort((a, b) => b.timestamp - a.timestamp)[0];

      return event;
    } catch (error) {
      console.error('Failed to get event at timestamp:', error);
      throw error;
    }
  }

  /**
   * Get code state at specific timestamp
   */
  async getCodeStateAtTimestamp(recordingId, timestamp) {
    try {
      const recording = await SessionRecord.findById(recordingId);

      if (!recording) {
        throw new Error('Recording not found');
      }

      let code = recording.initialCode || '';
      let language = recording.initialLanguage || 'javascript';

      // Apply all events up to the timestamp
      for (const event of recording.events) {
        if (event.timestamp > timestamp) break;

        if (event.type === 'code-change') {
          code = event.code;
        } else if (event.type === 'language-change') {
          language = event.language;
        }
      }

      return { code, language };
    } catch (error) {
      console.error('Failed to get code state:', error);
      throw error;
    }
  }

  /**
   * Delete recording
   */
  async deleteRecording(recordingId) {
    try {
      await SessionRecord.findByIdAndDelete(recordingId);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete recording:', error);
      throw error;
    }
  }
}

module.exports = new SessionRecordService();
