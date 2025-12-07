import mongoose from 'mongoose';

interface ISlot extends mongoose.Document {
  facultyId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  location: string;
  notes: string;
  capacity: number;
  isCancelled: boolean;
  createdAt: Date;
}

const slotSchema = new mongoose.Schema<ISlot>(
  {
    facultyId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      index: true,
      set: (value: any) => {
        if (typeof value === 'string') {
          return new mongoose.Types.ObjectId(value);
        }
        return value;
      }
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    location: { type: String, required: true },
    notes: String,
    capacity: { type: Number, default: 1 },
    isCancelled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ISlot>('Slot', slotSchema);
