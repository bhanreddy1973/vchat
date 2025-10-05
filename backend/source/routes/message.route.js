const express = require('express');

const router = express.Router();

router.get("/message",(req,res )=>{
    res.send("This is message page");
});



module.exports = router;