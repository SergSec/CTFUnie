const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'El contenido es requerido']
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El autor es requerido']
  },
  category: {
    type: String,
    enum: ['general', 'legal', 'financiero', 'tecnico', 'otro'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isResolved: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replyCount: {
    type: Number,
    default: 0
  },
  lastReplyAt: {
    type: Date,
    default: null
  },
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
forumPostSchema.index({ createdAt: -1 });
forumPostSchema.index({ category: 1, createdAt: -1 });
forumPostSchema.index({ authorId: 1 });
forumPostSchema.index({ isPinned: -1, createdAt: -1 });
forumPostSchema.index({ isResolved: 1, createdAt: -1 });

module.exports = mongoose.model('ForumPost', forumPostSchema);

