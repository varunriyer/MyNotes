import express from 'express';

import {
    getNotes,
    getNoteByID,
    createNote,
    updateNote,
    deleteNote,
} from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

//Note Operations Routes

router.route('/')
    .get(getNotes)
    .post(createNote);

router.route('/:id')
    .get(getNoteByID)
    .put(updateNote)
    .delete(deleteNote);

export default router;