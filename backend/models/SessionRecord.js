const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['code-change', 'execution', 'message', 'cursor', 'language-change'],
    required: true,
  },
  timestamp: {
    type: Number, // Unix timestamp in ms, relative to session start
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: String,
  userProfilePicture: String,
  
  // For code-change events
  code: String,
  language: String,

  // For execution events
  input: String,
  output: {
    stdout: String,
    stderr: String,
    compileOutput: String,
    status: String,
    time: Number,
    memory: Number,
  },

  // For message events
  text: String,

  // For cursor events
  cursorPosition: {
    line: Number,
    column: Number,
  },
});

const SessionRecordSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      uppercase: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    },
    title: {
      type: String,
      default: 'Session Recording',
    },
    description: String,
    
    // Recording metadata
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: Date,
    duration: Number, // in milliseconds
    
    // Participants
    participants: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        name: String,
        profilePicture: String,
      },
    ],
    
    // Initial state
    initialCode: String,
    initialLanguage: String,
    
    // All events in chronological order
    events: [eventSchema],
    
    // Statistics
    totalCodeChanges: { type: Number, default: 0 },
    totalExecutions: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    
    // Public replay link
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
SessionRecordSchema.index({ roomId: 1, createdAt: -1 });
SessionRecordSchema.index({ shareToken: 1 });
SessionRecordSchema.index({ 'participants.userId': 1 });

module.exports = mongoose.model('SessionRecord', SessionRecordSchema);
