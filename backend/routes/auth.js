const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = "MagusIsGonnaBecomeRichestManInTheCosmos";

//Route 1: Creating a User using: Post "/api/auth/createuser". Doesn't require Auth/ No login required
router.post('/createuser', [
    body('email', 'Enter a valid email').isEmail(),
    body('name', 'Name should at least have 5 characters').isLength({min: 5}),
    body('password', 'Name should at least have 8 characters').isLength({min: 8})
],async (req, res) =>{
    //If there are errors, return bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        //check whether the user with this email exist
        let user = await User.findOne({email: req.body.email});
        if(user){
        return res.status(400).json({error: "Sorry a user with this email exists"})
        }

    //hashing
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    //User creation
    user = await User.create({
        name: req.body.name, 
        password: secPass,
        email: req.body.email,
    })
    // console.log(user);
    const data = {
        user:{
            id: user.id
        }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    // console.log(jwtData);
    res.json({authtoken});
    }catch (error) {
        console.error(error.message);
        let delUser = await User.findOneAndDelete({email: req.body.email});
        res.status(500).send("Internal Server Error")
    }
})

//Route 2: Authenticate a User using: Post "/api/auth/login". no login required
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Enter a valid email').exists(),
], async (req, res) =>{
    //If there are errors. return a bad request
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
    const {email, password} = req.body;
    try{
        let user = await User.findOne({email});
        if(!user)
        {
            return res.status(400).json({error: "Please login with correct credentials"});
        }
        const passwordCompair = await bcrypt.compare(password, user.password);
        if(!passwordCompair)
        {
            return res.status(400).json({error: "Please login with correct credentials"});
        }
        const data = {
            user:{
                id : user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({authtoken});
    }catch(error)
    {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

//Route 3: get Loggedin user's details using: POST "/api/auth/getuser". login required
router.post('/getuser', fetchuser ,async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

module.exports = router;