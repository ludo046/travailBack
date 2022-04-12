const Joi = require('joi');

const loginSchema = Joi.object({

        email: Joi.string().email({minDomainSegments: 2, tlds:{allow:['fr','com', 'net']}})
        .error(new Error(`⚠️ Vérifie le format de ton email`)),

        password: Joi.string()
        .min(8)
        .max(16)
        .error(new Error('⚠️ Mot de passe incorrect')),
    })
    module.exports = loginSchema;

    