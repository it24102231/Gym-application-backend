const Feedback = require('../models/Feedback');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const buildFileUrl = (req, filePath) =>
  filePath ? `${req.protocol}://${req.get('host')}/${filePath.replace(/\\/g, '/')}` : null;

// @desc  Create feedback (member)
exports.createFeedback = async (req, res) => {
  try {
    const { type, trainerId, rating, message } = req.body;
    const imageUrl = req.file ? buildFileUrl(req, req.file.path) : null;
    const feedback = await Feedback.create({
      feedbackId: 'FBK-' + uuidv4().slice(0, 8).toUpperCase(),
      memberId: req.user._id,
      type, trainerId: trainerId || undefined, rating: Number(rating), message, imageUrl,
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc  Get my feedback (member)
exports.getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ memberId: req.user._id }).sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get all feedback (admin)
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().populate('memberId', 'name email').populate('trainerId', 'name').sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get public gym feedback for landing page
exports.getPublicFeedback = async (req, res) => {
  try {
    // Only return highly rated gym feedback for the landing page showcase
    const feedback = await Feedback.find({ type: 'Gym', rating: { $gte: 4 } })
      .populate('memberId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get feedback for a specific trainer
exports.getTrainerFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ type: 'Trainer', trainerId: req.params.trainerId })
      .populate('memberId', 'name')
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update feedback status (admin)
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    );
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json(feedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc  Delete feedback (member)
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    if (feedback.imageUrl) {
      const oldPath = feedback.imageUrl.split('/uploads/')[1];
      if (oldPath) fs.unlink(path.join('uploads', oldPath), () => {});
    }
    await feedback.deleteOne();
    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
