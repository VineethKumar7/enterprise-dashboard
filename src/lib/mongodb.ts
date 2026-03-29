import mongoose, { Mongoose } from 'mongoose';

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || '';

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectToDatabase(): Promise<Mongoose> {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Report Schema
const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['sales', 'accounts', 'opportunities', 'custom'],
    default: 'custom'
  },
  filters: { type: mongoose.Schema.Types.Mixed, default: {} },
  chartConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdBy: { type: String, required: true },
}, { timestamps: true });

// Analytics Cache Schema (for caching Dataverse data)
const analyticsCacheSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

analyticsCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);
export const AnalyticsCache = mongoose.models.AnalyticsCache || mongoose.model('AnalyticsCache', analyticsCacheSchema);
