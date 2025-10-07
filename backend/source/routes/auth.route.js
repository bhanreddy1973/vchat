const express = require('express');
const {signup, login, logout, updateProfile, checkAuth} = require('../controllers/auth.controller'); // ✅ Import checkAuth
const {protectRoute} = require('../middleware/auth.middleware');
const {protectRoute: arcjetProtect} = require('../middleware/arcjet.middleware');

const router = express.Router();

// router.use(arcjetProtect);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/check", protectRoute, checkAuth); // ✅ Use checkAuth function

router.put("/update-profile", protectRoute, updateProfile);

module.exports = router;