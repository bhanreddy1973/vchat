const { getArcjet } = require('../lib/arcjet');

const protectRoute = async (req, res, next) => {
    try {
        const arcjet = await getArcjet();
        
        // ✅ If arcjet fails to load, just continue without protection
        if (!arcjet) {
            console.warn('Arcjet not available, skipping protection');
            return next();
        }
        
        const decision = await arcjet.protect(req);
        console.log('Arcjet decision', decision);
        
        if (decision.isDenied()) {
            console.log('Request blocked by Arcjet:', decision.reason);
            return res.status(429).json({ 
                message: 'Too many requests',
                reason: decision.reason?.type || 'rate_limit'
            });
        }
        
        next();
    } catch (error) {
        console.error('Arcjet middleware error:', error);
        // ✅ Don't block requests if arcjet fails
        next();
    }
};

module.exports = { protectRoute };