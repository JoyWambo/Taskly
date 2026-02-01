import mongoose from 'mongoose';

const taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please enter a task title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'in-progress', 'completed', 'cancelled'],
        message: 'Status must be pending, in-progress, completed, or cancelled',
      },
      default: 'pending',
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: 'Priority must be low, medium, high, or urgent',
      },
      default: 'medium',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    deadline: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > new Date();
        },
        message: 'Deadline must be in the future',
      },
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    estimatedHours: {
      type: Number,
      min: [0, 'Estimated hours cannot be negative'],
      max: [1000, 'Estimated hours cannot exceed 1000'],
    },
    actualHours: {
      type: Number,
      min: [0, 'Actual hours cannot be negative'],
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [30, 'Tag cannot exceed 30 characters'],
      },
    ],
    attachments: [
      {
        fileName: {
          type: String,
          required: true,
        },
        fileUrl: {
          type: String,
          required: true,
        },
        fileSize: {
          type: Number,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        text: {
          type: String,
          required: true,
          maxlength: [500, 'Comment cannot exceed 500 characters'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    subtasks: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
          maxlength: [100, 'Subtask title cannot exceed 100 characters'],
        },
        isCompleted: {
          type: Boolean,
          default: false,
        },
        completedAt: {
          type: Date,
          default: null,
        },
      },
    ],
    reminders: [
      {
        date: {
          type: Date,
          required: true,
        },
        message: {
          type: String,
          maxlength: [200, 'Reminder message cannot exceed 200 characters'],
        },
        isSent: {
          type: Boolean,
          default: false,
        },
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    progression: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to automatically set completedAt when status changes to completed
taskSchema.pre('save', async function () {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
      this.progression = 100;
    } else if (this.status !== 'completed' && this.completedAt) {
      this.completedAt = null;
      if (this.progression === 100) {
        this.progression = this.status === 'in-progress' ? 50 : 0;
      }
    }
  }

  // Set archived timestamp
  if (this.isModified('isArchived') && this.isArchived && !this.archivedAt) {
    this.archivedAt = new Date();
  } else if (this.isModified('isArchived') && !this.isArchived) {
    this.archivedAt = null;
  }
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function () {
  return (
    this.deadline && new Date() > this.deadline && this.status !== 'completed'
  );
});

// Virtual for days until deadline
taskSchema.virtual('daysUntilDeadline').get(function () {
  if (!this.deadline) return null;
  const today = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for completion percentage based on subtasks
taskSchema.virtual('subtaskCompletionRate').get(function () {
  if (this.subtasks.length === 0) return 0;
  const completedSubtasks = this.subtasks.filter(
    (subtask) => subtask.isCompleted
  ).length;
  return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

// Method to calculate total time spent
taskSchema.methods.getTotalTimeSpent = function () {
  return this.actualHours || 0;
};

// Method to get task summary
taskSchema.methods.getSummary = function () {
  return {
    id: this._id,
    title: this.title,
    status: this.status,
    priority: this.priority,
    deadline: this.deadline,
    isOverdue: this.isOverdue,
    progression: this.progression,
    subtaskCount: this.subtasks.length,
    completedSubtasks: this.subtasks.filter((subtask) => subtask.isCompleted)
      .length,
  };
};

// Indexes for better query performance
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, deadline: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, category: 1 });
taskSchema.index({ tags: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ deadline: 1 });
taskSchema.index({ title: 'text', description: 'text' });

// Ensure virtual fields are serialized
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

const Task = mongoose.model('Task', taskSchema);

export default Task;
