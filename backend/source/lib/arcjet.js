// ✅ Use dynamic import instead of require
let arcjet;

const initializeArcjet = async () => {
    if (!arcjet) {
        const arcjetModule = await import('@arcjet/node');
        arcjet = arcjetModule.default;
    }
    return arcjet;
};

const { Env } = require('./env');

// ✅ Create arcjet configuration function
const createArcjetInstance = async () => {
    const arcjetLib = await initializeArcjet();
    
    return arcjetLib({
        key: Env.ARCJET_KEY,
        rules: [
            // Shield rule
            arcjetLib.shield({
                mode: Env.ARCJET_ENV === 'development' ? 'DRY_RUN' : 'LIVE'
            }),
            // Rate limiting
            arcjetLib.rateLimit({
                mode: Env.ARCJET_ENV === 'development' ? 'DRY_RUN' : 'LIVE',
                characteristics: ['ip'],
                window: '1m',
                max: 60
            }),
            // Bot detection
            arcjetLib.detectBot({
                mode: Env.ARCJET_ENV === 'development' ? 'DRY_RUN' : 'LIVE',
                allow: []
            })
        ]
    });
};

module.exports = { createArcjetInstance };