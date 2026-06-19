import mongoose, { Schema, Document, Model } from 'mongoose';
import { EVENT_TYPES } from '../utils/constants';

export interface IEventDocument extends Document {
  session_id: string;
  event_type: string;
  page_url: string;
  timestamp: Date;
  x?: number;
  y?: number;
  viewport_width?: number;
  viewport_height?: number;
  created_at: Date;
}

const EventSchema = new Schema<IEventDocument>(
  {
    session_id: {
      type: String,
      required: true,
      index: true,
    },
    event_type: {
      type: String,
      enum: [EVENT_TYPES.PAGE_VIEW, EVENT_TYPES.CLICK],
      required: true,
      index: true,
    },
    page_url: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    x: {
      type: Number,
    },
    y: {
      type: Number,
    },
    viewport_width: {
      type: Number,
    },
    viewport_height: {
      type: Number,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'events',
    timestamps: false,
    versionKey: false,
  }
);

// Compound indexes for performance
EventSchema.index({ session_id: 1, timestamp: 1 });
EventSchema.index({ page_url: 1, event_type: 1, timestamp: 1 });
EventSchema.index({ event_type: 1, timestamp: 1 });
// TTL index for 90-day data retention (optional — enable in production)
// EventSchema.index({ created_at: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const EventModel: Model<IEventDocument> = mongoose.model<IEventDocument>(
  'Event',
  EventSchema
);
