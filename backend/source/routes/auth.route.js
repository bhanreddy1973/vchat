const express = require('express');


const router = express.Router();

router.get("/signup",(req,res )=>{
    res.send("This is signup page");
});

router.get("/login",(req,res )=>{
    console.log("Login API called");
    res.send("This is login page");
});

router.get("/logout",(req,res )=>{
    res.send("This is logout page");
});

module.exports = router;