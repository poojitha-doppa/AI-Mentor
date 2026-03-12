import express from 'express';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Roadmap from '../models/Roadmap.js';

const router = express.Router();

// Save/Create a roadmap
router.post('/', async (req, res) => {
  try {
    const { user, userId, userEmail, title, description, currentRole, targetRole, timeline, stages, roadmapText, milestones, status } = req.body;

    if (!title && !targetRole) {
      return res.status(400).json({ error: 'Title or target role is required' });
    }

    // Handle user field properly
    let userObjectId = null;
    if (user && user !== 'guest' && mongoose.Types.ObjectId.isValid(user)) {
      userObjectId = user;
    }

    const roadmap = await Roadmap.create({
      user: userObjectId,
      userId: userId || (user === 'guest' ? 'guest' : user),
      userEmail: userEmail || null,
      title: title || `Roadmap to ${targetRole}`,
      description: description || '',
      currentRole: currentRole || '',
      targetRole: targetRole || '',
      timeline: timeline || '6 months',
      roadmapText: roadmapText || '',
      stages: stages || 0,
      milestones: milestones || [],
      status: status || 'draft'
    });

    res.status(201).json({ success: true, roadmapId: roadmap._id, data: roadmap });
  } catch (error) {
    console.error('Roadmap creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate career roadmap and persist
router.post('/generate', async (req, res) => {
  const { currentRole, targetRole, timeline, userId, userEmail } = req.body;

  if (!currentRole || !targetRole) {
    return res.status(400).json({ error: 'Current and target roles are required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Create a detailed career roadmap from "${currentRole}" to "${targetRole}" within ${timeline || '12 months'}. Include skill gaps, learning resources, and milestones.`;
    
    const result = await model.generateContent(prompt);
    const roadmapText = result.response.text();

    // Handle user field properly
    let userObjectId = null;
    if (userId && userId !== 'guest' && mongoose.Types.ObjectId.isValid(userId)) {
      userObjectId = userId;
    }

    const roadmap = await Roadmap.create({
      user: userObjectId,
      userId: userId || 'guest',
      userEmail: userEmail || null,
      title: `Roadmap from ${currentRole} to ${targetRole}`,
      currentRole,
      targetRole,
      timeline: timeline || '12 months',
      roadmapText,
      status: 'draft'
    });

    res.json({ 
      currentRole,
      targetRole,
      roadmap: roadmapText,
      roadmapId: roadmap._id,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Roadmap generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List roadmaps for a user
router.get('/', async (req, res) => {
  try {
    const { userId, userEmail } = req.query;
    
    let filter = {};
    if (userId) {
      if (mongoose.Types.ObjectId.isValid(userId) && userId !== 'guest') {
        filter = { user: userId };
      } else {
        filter = { userId: userId };
      }
    } else if (userEmail) {
      filter = { userEmail: userEmail };
    }
    
    const roadmaps = await Roadmap.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, roadmaps, count: roadmaps.length });
  } catch (error) {
    console.error('Roadmap fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single roadmap by ID
router.get('/:id', async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }
    res.json({ success: true, data: roadmap });
  } catch (error) {
    console.error('Roadmap fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update roadmap progress
router.put('/:id/progress', async (req, res) => {
  try {
    const { progress, completedStages } = req.body;
    
    const updateData = {
      progress: progress,
      'metadata.completedStages': completedStages
    };
    
    if (progress >= 100) {
      updateData.status = 'completed';
    }
    
    const roadmap = await Roadmap.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    res.json({ success: true, data: roadmap });
  } catch (error) {
    console.error('Roadmap update error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
