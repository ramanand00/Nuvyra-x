const express = require('express');
const { getChats, getChat, createChat, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes below are protected

router.get('/', getChats);
router.get('/:chatId', getChat);
router.post('/', createChat);
router.post('/:chatId/messages', sendMessage);

module.exports = router;