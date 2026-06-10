import { Schema, model, Types, HydratedDocument } from "mongoose";

export type CoachMessageRole = "user" | "assistant";

export interface ICoachMessage {
  role: CoachMessageRole;
  content: string;
  responseId?: string;
  createdAt: Date;
}

export interface ICoachConversation {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  messages: ICoachMessage[];
  lastResponseId?: string;
  modelName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CoachConversationDoc = HydratedDocument<ICoachConversation>;

const CoachMessageSchema = new Schema<ICoachMessage>(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 12000,
    },
    responseId: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const CoachConversationSchema = new Schema<ICoachConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      default: "Fitboard Coach",
    },
    messages: {
      type: [CoachMessageSchema],
      default: [],
    },
    lastResponseId: {
      type: String,
    },
    modelName: {
      type: String,
    },
  },
  { timestamps: true },
);

CoachConversationSchema.index({ userId: 1, updatedAt: -1 });

export const CoachConversation = model<ICoachConversation>(
  "CoachConversation",
  CoachConversationSchema,
);
