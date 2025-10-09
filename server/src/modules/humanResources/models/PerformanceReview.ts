import mongoose, { Document, Schema } from 'mongoose';
import { IPerformanceReview } from '../interfaces/IHumanResources';

export interface IPerformanceReviewDocument extends IPerformanceReview, Document {}

const PerformanceReviewSchema = new Schema<IPerformanceReviewDocument>({
  reviewId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  employeeId: {
    type: String,
    required: true,
    ref: 'EmployeeRecord',
    index: true
  },
  reviewerId: {
    type: String,
    required: true,
    ref: 'Staff',
    index: true
  },
  reviewPeriodStart: {
    type: Date,
    required: true,
    index: true
  },
  reviewPeriodEnd: {
    type: Date,
    required: true,
    index: true
  },
  overallRating: {
    type: String,
    enum: ['excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory'],
    required: true,
    index: true
  },
  goalsAchieved: {
    type: String
  },
  areasForImprovement: {
    type: String
  },
  developmentPlan: {
    type: String
  },
  comments: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'completed'],
    default: 'draft',
    index: true
  }
}, {
  timestamps: true,
  collection: 'performance_reviews'
});

// Indexes for performance
PerformanceReviewSchema.index({ employeeId: 1, reviewPeriodEnd: -1 });
PerformanceReviewSchema.index({ reviewerId: 1, reviewPeriodEnd: -1 });
PerformanceReviewSchema.index({ status: 1, reviewPeriodEnd: -1 });

export const PerformanceReviewModel = mongoose.model<IPerformanceReviewDocument>('PerformanceReview', PerformanceReviewSchema);
