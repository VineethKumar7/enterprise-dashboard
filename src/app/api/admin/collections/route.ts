import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectToDatabase();
    
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database not connected' });
    }

    const collectionsList = await db.listCollections().toArray();
    
    const collections = await Promise.all(
      collectionsList.map(async (col) => {
        const collection = db.collection(col.name);
        const count = await collection.countDocuments();
        const documents = await collection.find({}).limit(10).toArray();
        
        // Convert ObjectId to string for JSON serialization
        const serializedDocs = documents.map(doc => ({
          ...doc,
          _id: doc._id.toString(),
        }));
        
        return {
          name: col.name,
          count,
          documents: serializedDocs,
        };
      })
    );

    return NextResponse.json({ success: true, collections });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch collections' 
    });
  }
}
