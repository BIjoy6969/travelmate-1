import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      default: "Leisure",
      trim: true,
    },
  },
  { timestamps: true } // gives createdAt/updatedAt (needed for sort)
);

// Prevent model overwrite error in dev hot-reload
const Trip = mongoose.models.Trip || mongoose.model("Trip", tripSchema);

export default Trip;
