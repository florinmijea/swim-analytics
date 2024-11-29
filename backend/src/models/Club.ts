import mongoose, { Schema, Document } from 'mongoose';

export interface IClub extends Document {
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  coach: string;
  swimmers: Schema.Types.ObjectId[];
}

const ClubSchema: Schema = new Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  address: String,
  phone: String,
  email: String,
  website: String,
  coach: String,
  swimmers: [{ type: Schema.Types.ObjectId, ref: 'Swimmer' }]
});

export default mongoose.model<IClub>('Club', ClubSchema);
