import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISessionData {
  first_seen: Date;
  last_seen: Date;
  event_count: number;
  page_views: number;
  clicks: number;
  pages_visited: string[];
}

export interface ISessionDocument extends Document<string>, ISessionData {
  _id: string;
}

const SessionSchema = new Schema<ISessionDocument>(
  {
    _id: {
      type: String,
      required: true,
    },
    first_seen: {
      type: Date,
      required: true,
      index: true,
    },
    last_seen: {
      type: Date,
      required: true,
      index: true,
    },
    event_count: {
      type: Number,
      default: 0,
    },
    page_views: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    pages_visited: {
      type: [String],
      default: [],
    },
  },
  {
    collection: 'sessions',
    timestamps: false,
    versionKey: false,
  }
);

// Indexes for sorting and pagination
SessionSchema.index({ last_seen: -1 });
SessionSchema.index({ first_seen: -1 });
SessionSchema.index({ event_count: -1 });

export const SessionModel: Model<ISessionDocument> = mongoose.model<ISessionDocument>(
  'Session',
  SessionSchema
);
