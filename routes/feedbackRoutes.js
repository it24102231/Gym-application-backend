const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadImage } = require('../middleware/upload');
const {
  createFeedback, getMyFeedback, getAllFeedback,
  updateFeedbackStatus, deleteFeedback, getTrainerFeedback,
  getPublicFeedback,
} = require('../controllers/feedbackController');

router.get('/public', getPublicFeedback); // Open to all (no protect)
router.post('/', protect, uploadImage, createFeedback);
router.get('/my', protect, getMyFeedback);
router.get('/', protect, adminOnly, getAllFeedback);
router.get('/trainer/:trainerId', protect, getTrainerFeedback);
router.patch('/:id/status', protect, adminOnly, updateFeedbackStatus);
router.delete('/:id', protect, deleteFeedback);

module.exports = router;
