const express = require('express');
const {signup} = require('../controllers/auth.controller');
const {login }= require('../controllers/auth.controller');
const {logout} = require('../controllers/auth.controller');
const {protectRoute} = require('../middleware/auth.middleware');
const {updateProfile} = require('../controllers/auth.controller');
const {protectRoute: arcjetProtect} = require('../middleware/arcjet.middleware');
// const { arcjetProtect } = require('../middleware/arcjet.middleware');
const router = express.Router();

// router.get("/test", arcjetProtect, (req,res )=>{
//     res.status(200).json({message:"test route"});
// });
router.use(arcjetProtect);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);


router.put("/update-profile", protectRoute, updateProfile);

router.get("/check",protectRoute, (req,res)=>{
    res.status(200).json({message:"Protected route accessed", user:req.user});
});


module.exports = router;