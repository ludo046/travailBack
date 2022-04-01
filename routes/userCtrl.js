const bcrypt = require('bcrypt');
const jwtUtils = require('../utils/jwt.utils');
const models = require('../models')
const asyncLib = require('async');
const {invalid} = require('joi');
const registerSchema = require('../utils/joi/registerSchema');
const loginSchema = require('../utils/joi/loginSchema');
const updateUserSchema = require('../utils/joi/updateProfile');
const nodemailer = require('nodemailer'),
      fs = require('fs'),
      hogan = require('hogan.js'),
      inlineCss = require('inline-css');
const pathResolver = require('path') ;
const crypto = require('crypto');
require("dotenv").config();




module.exports = {

    register: async function (req,res) {
        try{
            const valid = await registerSchema.validateAsync(req.body);
            if(valid){
                const firstname = req.body.firstname;
                const lastname = req.body.lastname;
                const age = req.body.age;
                const email = req.body.email;
                const password = req.body.password;



                if(firstname == null || lastname == null || age == null || email == null ||password == null) {
                    return res.status(400).json({ 'error' : 'tous les champs de sont pas remplis' });
                }
                if(age < 18){
                    return res.status(400).json({ 'error' : `Vous n'avez pas l'âge requis` });
                }

                models.User.findOne({
                    attributes: ['email'],
                    where: {email: email}
                })
                .then(function(userFound){
                    if(!userFound){
                        let code = Math.floor(100000 + Math.random() * 900000);

                        bcrypt.hash(password, 10, function(err, bcryptedPassword){
                            const newUser = models.User.create({
                                firstname: firstname,
                                lastname: lastname,
                                age: age,
                                email: email,
                                password: bcryptedPassword,
                                isAdmin: 0,
                                code: code
                            })
                            .then(function(newUser){
                                // return res.status(201).json({
                                //     'userId' : newUser.id,
                                //     token: jwtUtils.generateTokenForUser(newUser)
                                // })
                               let transport = nodemailer.createTransport({
                                   service:"gmail",
                                   host: 'smtp.gmail.com',
                                   port: 587,
                                   secure: true,
                                   auth: {
                                       user: 'travailaveclesourire@gmail.com',
                                       pass: 'Fripon046'
                                   }
                               });

                               (async function(){
                                   try{
                                    const templateFile = fs.readFileSync(pathResolver.join(__dirname,'./template/template.html'))
                            
                                    //const templateFile = fs.readFileSync(template);
                                    const templateStyled = await inlineCss(templateFile.toString(), {url: "file://"+__dirname+"/template/"});
                                    const templateCompiled = hogan.compile(templateStyled);
                                    const templateRendered = templateCompiled.render({name: newUser.firstname, code: code});

                                    let mailOption = {
                                        from: process.env.USER,
                                        to: newUser.email,
                                        subject: 'valider ton compte',
                                        html: templateRendered
                                    };
                                    
                                   await transport.sendMail(mailOption, (error, info) => {
                                        if(error){
                                            return console.log(error);
                                        } else {
                                             console.log('message send :', info.messageId);
                                             console.log('preview url : ', nodemailer.getTestMessageUrl(info));
                                        }
                                        res.send({message: 'ok'})
                                    })
                                   } catch(e){
                                    console.error(e);
                                   }
                               })()

   

                            })
                            .catch(function(error){
                                return res.status(500).json({message: error.message})
                            })
                        })
                    } else {
                        return res.status(409).json({ 'error' : 'un compte utilisateur existe déjà avec cette adresse mail' });
                    }
                })
                .catch(function(error){
                    return res.status(500).json({message: error.message})
                })
            } else {
                throw error(invalid)
            }
        }catch (error){
            res.status(400).json({message: error.message})
        }
    },

    verificationUser: function(req,res){
        const code = req.body.code;
        console.log(req.body);

        models.User.findOne({
            where: {code: code}
        })
        .then(function(user){
            if(user){
                user.update({
                    activate: true
                }).then(() => {
                    res.send({
                        'userId': user.id,
                        'isAdmin': user.isAdmin,
                        'token': jwtUtils.generateTokenForUser(user),
                        'activate': user.activate
                    })
                })
                .catch(function(error){
                    return res.status(400).json({message: error.message})
                })
            } else {
                return res.status(400).json({message: 'code de validation incorrect'})
            }
        })
    },

    login: async function(req, res) {
        try{
            const valid = await loginSchema.validateAsync(req.body);
            if(valid){
                const email = req.body.email;
                const password = req.body.password;

                if(email == null || password == null){
                    return res.status(400).json({'error' : 'tous les champs ne sont pas remplis'});
                }
                models.User.findOne({
                    where: {email: email}
                })
                .then(function(userFound){
                    if(userFound){
                        userFound.update({
                            online: true
                        })
                        bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt){
                            if(userFound.activate === false){
                                return res.status(400).json({message: `ton compte n'est pas activé`})
                            } else if(resBycrypt){

                                return res.status(200).json({
                                    'userId' : userFound.id,
                                    'statut' : userFound.online,
                                    'name': userFound.lastname,
                                    'firstname':userFound.firstname,
                                    'picture': userFound.picture,
                                    'isAdmin' : userFound.isAdmin,
                                    'token' : jwtUtils.generateTokenForUser(userFound)
                                })
                            } else {
                                return res.status(403).json({'error': 'mot de passe incorrect'});
                            }
                        })
                    } else {
                        return res.status(404).json({'error': 'utilisateur inexistant '})
                    }
                })
                .catch(function(err){
                    return res.status(500).json({'error' : `impossible de verifier l'utilisateur`})
                })
            } else {
                throw error(invalid)
            }
        }catch(error){
            res.status(400).json({message: error.message})
        }
    },

    deleteUser: function(req, res){
        let headerAuth = req.headers['authorization'];
        let userId = jwtUtils.getUserId(headerAuth)
        console.log(userId);
        
        //verifie que le userId n'est pas null 
        if (userId <= 0){
          return res.status(400).json({ 'error': 'wrong token' })
        };
        
        //cherche le user 
        models.User.findOne({
          where: {
            id: userId,
          }
        }).then(function(user){
            console.log(user);
          models.User.destroy({
              where: {
                id: userId
              }
          })
        }).catch(function(err){
          res.status(500).json({ message: err.message})
        })
    },

    disconnect: function(req,res){ 
        const headerAuth = req.headers['authorization'];
        const userId = jwtUtils.getUserId(headerAuth)

        models.User.findOne({
            where: {id: userId}
        })
        .then(function(userFound){
            userFound.update({
                online: false
            })
        })
        .catch(function (err){
            res.status(500).json({message: err.message})
        })

    },

    getAllUser: function(req,res){
        let headerAuth = req.headers["authorization"];
        let userId = jwtUtils.getUserId(headerAuth);
        let fields  = req.query.fields;
        let order   = req.query.order;

        if(userId <= 0){
            return res.status(400).json({error: 'veuillez vous authentifier'})
        }
        
        models.User.findAll({
            order: [(order != null) ? order.split(':') : ['id']],
            attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
        }).then(function (users){
            if(users){
                return res.status(200).json(users)
            } else {
                res.status(404).json({error : 'aucun utilisateur trouvé'})
            }
        }).catch(function (err){
            res.status(500).json({message: err.message})
        })
    },

    getUserProfile: function(req, res){
        const headerAuth = req.headers['authorization'];
        const userId = jwtUtils.getUserId(headerAuth)

        if(userId <= 0 ){
            return res.status(400).json({'error': `vous n'êtes pas identifié`});
        }

        models.User.findOne({
            attributes: ['firstname', 'lastname', 'email', 'age', 'picture'],
            where: {id: userId}
        }).then(function(user){
            if(user){
                res.status(201).json(user);
            } else {
                res.status(404).json({'error': 'utilisateur non trouvé'});
            }
        }).catch(function(err){
            res.status(500).json({message: err.message})
        })
    },

    modifyProfile: async function(req, res){
        try{
            const valid = await updateUserSchema.validateAsync(req.body);
            if(valid){
                const headerAuth = req.headers['authorization'];
                const userId = jwtUtils.getUserId(headerAuth)

                const firstname = req.body.firstname;
                const lastname = req.body.lastname;
                const email = req.body.email;
                const age = req.body.age;
                let picture = null;
                let files = req.files;
                if(req.files){
                    for(let i = 0; i < files.length; i++){
                        picture = `${req.protocol}://${req.get("host")}/images/${req.files[i].filename}`
                       } 
                }

                if(userId <= 0 ){
                    return res.status(400).json({'error': `vous n'êtes pas identifié`});
                }

                asyncLib.waterfall([
                    function(done){
                        models.User.findOne({
                            where: {id: userId}
                        }).then(function(userFound){
                            done(null, userFound);
                        }).catch(function(err){
                            return res.status(500).json({message: err.message})
                        })
                    },
                    function(userFound, done){
                        if(userFound){
                            userFound.update({
                                firstname: (firstname ? firstname : userFound.firstname),
                                lastname: (lastname ? lastname : userFound.lastname),
                                email: (email ? email : userFound.email),
                                age: (age ? age : userFound.age),
                                picture: (picture ? picture : userFound.picture)
                            }).then(function(){
                                done(userFound);
                            }).catch(function(err){
                                return res.status(500).json({message: err.message})
                            });
                        } else {
                            res.status(404).json({ 'error': 'user not found' })
                        }
                    },
                ], function(userFound){
                    if(userFound){
                        return res.status(201).json(userFound);
                    } else {
                        return res.status(500).json({'error' : 'impossible de mettre le profil à jour'})
                    }
                })
            } else {
                throw invalid({error})
            }
        }catch(error){
            res.status(400).json({message: error.message})
        }

    },

    // resetPassword: async function(req, res){
    //     if(!req.body.email){
    //         return res.status(500).json({message : 'email requis'});
    //     }
    //     const user = await models.user.findOne({
    //         email : req.body.email
    //     });
    //     if(!user){
    //         return res.status(409).json({message : "l'email n'existe pas"});
    //     }
    //     else{
    //         const passwordToken = jwtUtils.generateTokenForUser(user.id);
    //         user.update({
    //                 passwordToken: (passwordToken ? passwordToken : user.passwordToken)
    //             }).then(function(){
    //                 done(userFound);
    //             }).catch(function(err){
    //                 return res.status(500).json({message: err.message})
    //             });
    //         }
    //         let transport = nodemailer.createTransport({
    //             service:"gmail",
    //             host: 'smtp.gmail.com',
    //             port: 587,
    //             secure: true,
    //             auth: {
    //                 user: 'travailaveclesourire@gmail.com',
    //                 pass: 'Fripon046'
    //             }
    //         });

    //         (async function(){
    //             try{
    //              const templateFile = fs.readFileSync(pathResolver.join(__dirname,'./template/templatePwd.html'))
         
    //              const templateStyled = await inlineCss(templateFile.toString(), {url: "file://"+__dirname+"/template/"});
    //              const templateCompiled = hogan.compile(templateStyled);
    //              const templateRendered = templateCompiled.render({name: user.firstname, token: passwordToken});

    //              let mailOption = {
    //                  from: process.env.USER,
    //                  to: newUser.email,
    //                  subject: 'réinitialise ton mot de passe',
    //                  html: templateRendered
    //              };
                 
    //             await transport.sendMail(mailOption, (error, info) => {
    //                  if(error){
    //                      return console.log(error);
    //                  } else {
    //                       console.log('message send :', info.messageId);
    //                       console.log('preview url : ', nodemailer.getTestMessageUrl(info));
    //                  }
    //                  res.send({message: 'ok'})
    //              })
    //             } catch(e){
    //              console.error(e);
    //             }
    //         })()
    //     },

        validPasswordToken: async function(req, res){
            if(!req.body.resetToken){
                return res.status(500).json({message : 'token requis'});
            }
            const decodedToken = req.body.resetToken.jwtUtils.getUserId()
            const user = await models.user.findOne({
                id : decodedToken
            });
            if(user.passwordToken === req.body.resetToken){
                return res.send('ok')
            }

        },

        // newPassword: async function(req,res){
        //     const userId = this.validPasswordToken.decodedToken;
        //     if (!userId){
        //         return res.status(409).json({message : 'token expiré'})
        //     }
        //     const newPassword = bcrypt.hash(req.body.password, 10);
        //     const user = models.user.findOne({
        //         id : userId
        //     })
        //     user.update({
        //        password : newPassword 
        //     })
        // }
}