const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');


//Route 1: Get all the notes using: GET "/api/notes/fetchallnotes. Login required
router.get('/fetchallnotes', fetchuser, async (req, res) =>{
    try {
        const notes = await Notes.find({users: req.user.id});
        res.json(notes)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})

//Route 2: adding the notes using: POST "/api/notes/addnotes. Login required
router.post('/addnotes', fetchuser, [
    body('title', 'Title can not be empty').isLength({min: 5}),
    body('description', 'Description can not be empty').isLength({min: 20}),
], async (req, res) =>{

    const {title, description, tag} = req.body;
    //If there are errors, return bad request and the error
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      try {
          const notes = new Notes({
              title, description, tag, users: req.user.id
          })
          const savedNote = await notes.save()
          console.log(savedNote)
          res.json(savedNote)
      } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})

//Route 3: Update the notes using: POST "/api/notes/updatenotes. Login required
router.put('/updatenotes/:id', fetchuser, async (req, res) =>{

    try {
        const {title, description, tag} = req.body;
        const newNote = {};
        if(title) {newNote.title = title};
        if(description) {newNote.description = description};
        if(tag) {newNote.tag = tag};
          
        let note = await Notes.findById(req.params.id);
        if(!note)
        {
            return res.status(404).send("Not Found");
        }
    
        if(note.users.toString() !== req.user.id)
        {
            return  res.status(401).send("Not Allowed");
        }
    
        note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true});
        res.json({"Success": "Note has been Updated", note:note});

    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }

})

//Route 4: deleting a note using: POST "/api/notes/deletenotes. Login required
router.delete('/deletenotes/:id', fetchuser, async (req, res) => {
    try {
        note = await Notes.findById(req.params.id);
        if(!note)
        {
            return res.status(404).send("Not Found");
        }
        if(req.user.id !== note.users.toString())
        {
            return res.status(404).send("Not Allowed");
        }
        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({"Success": "Note has been deleted"});
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})

module.exports = router;