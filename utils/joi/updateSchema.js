const Joi = require('joi');

const updatePostSchema = Joi.object({
            title: Joi.string()
            .max(100),

            project : Joi.string()
            .allow(null,''),

            content: Joi.string()
            .allow(null,'')
            .max(1200),

            image: Joi.any(),

            movie: Joi.any(),

})
    module.exports = updatePostSchema;
