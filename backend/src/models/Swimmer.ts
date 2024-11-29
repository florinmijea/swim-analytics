import mongoose, { Schema, Document } from 'mongoose';

export interface IParticipation {
  competitionName: string;
  date: {
    start: Date;
    end: Date;
  };
  results: {
    style: string;
    time: string;
    place: number;
  }[];
}

export interface ISwimmer extends Document {
  lpinId: number;
  gender: string;
  birthYear: number;
  club: Schema.Types.ObjectId;
  lpinLicenseNumber: string;
  federationLicenseNumber: string;
  participations: IParticipation[];
  personalBests: {
    style: string;
    time: string;
    competition: string;
    date: Date;
  }[];
}

const SwimmerSchema: Schema = new Schema({
  lpinId: { type: Number, required: true, unique: true },
  gender: { type: String, required: true },
  birthYear: { type: Number, required: true },
  club: { type: Schema.Types.ObjectId, ref: 'Club', required: true },
  lpinLicenseNumber: { type: String },
  federationLicenseNumber: { type: String },
  participations: [{
    competitionName: String,
    date: {
      start: Date,
      end: Date
    },
    results: [{
      style: String,
      time: String,
      place: Number
    }]
  }],
  personalBests: [{
    style: String,
    time: String,
    competition: String,
    date: Date
  }]
});

export default mongoose.model<ISwimmer>('Swimmer', SwimmerSchema);
