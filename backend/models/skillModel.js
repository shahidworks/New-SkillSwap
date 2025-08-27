// models/skillModel.js
import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  rate: { type: Number }, // or String, depending on your design
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], default: 'Beginner' },
  description: { type: String }
}, { timestamps: true });

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
