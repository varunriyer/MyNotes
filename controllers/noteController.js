import Note from '../models/noteModel.js'

//@desc     Get all notes
//@route    GET /api/notes
//@access   Private

export const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user._id });
        res.json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

//@desc     Get a node by ID
//@route    GET /api/notes/:id
//@access   Private

export const getNoteByID = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        //Check if user owns the note
        if (note.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        res.json(note);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


//@desc     Create a new note
//@route    POST /api/notes
//@access   Private

export const createNote = async (req, res) => {
    try {
        const { title, content } = req.body;

        const note = await Note.create({
            title,
            content,
            user: req.user._id,
        });

        res.status(201).json(note);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

//@desc     Update a note
//@route    PUT /api/notes/:id
//@access   Private

export const updateNote = async (req, res) => {
    try {
        const { title, content } = req.body;

        let note = await Note.findById(req.params.id);

        //Check if note exists
        if (!note) {
            return res.status(404).json({ message: `Note - ${req.params.id} does not exist` });
        }

        //Check if user owns the note 
        if (note.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: `${req.user._id} is not authorized for note ID - ${req.params.id}` });
        }

        //Update note 
        note = await Note.findByIdAndUpdate(
            req.params.id,
            { title, content },
            { new: true }
        );

        res.json(note);
    } catch (error) {
        console.error(error);
        res.status(500).message({ message: 'Server error', error: error.message });
    }
};

//@desc     Delete a note
//@route    DELETE /api/notes/:id
//@access   Private

export const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        //Check if note exists
        if (!note) {
            return res.status(404).json({ message: `${req.params.id} is not valid note ID` });
        }

        //Check if user owns the note 
        if (note.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: `${req.user._id} cannot delete note ID: ${req.params.id}` });
        }

        //Delete a note

        await note.deleteOne();

        res.json({ message: `${req.params.id} Note deleted` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
