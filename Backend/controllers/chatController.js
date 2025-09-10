const Chat = require('../models/Chat');
const User = require('../models/User');

exports.getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const chats = await Chat.find({ 
      participants: userId 
    })
    .populate('participants', 'name email avatar lastSeen')
    .sort({ updatedAt: -1 });
    
    res.status(200).json({ chats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const chat = await Chat.findById(chatId)
      .populate('participants', 'name email avatar lastSeen')
      .populate('messages.sender', 'name avatar');
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    res.status(200).json({ chat });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createChat = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user.id;
    
    // Check if chat already exists between these users
    let chat = await Chat.findOne({
      participants: { $all: [userId, participantId] }
    });
    
    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        participants: [userId, participantId],
        messages: []
      });
    }
    
    await chat.populate('participants', 'name email avatar lastSeen');
    
    res.status(200).json({ chat });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Create new message
    const newMessage = {
      sender: userId,
      content,
      timestamp: new Date()
    };
    
    // Add message to chat
    chat.messages.push(newMessage);
    chat.lastMessage = newMessage;
    await chat.save();
    
    // Populate sender info
    await chat.populate('messages.sender', 'name avatar');
    await chat.populate('participants', 'name email avatar lastSeen');
    
    const addedMessage = chat.messages[chat.messages.length - 1];
    
    res.status(201).json({ message: addedMessage });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};