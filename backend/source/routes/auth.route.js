const express = require('express');
const {signup} = require('../controllers/auth.controller');
const {login }= require('../controllers/auth.controller');
const {logout} = require('../controllers/auth.controller');

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;