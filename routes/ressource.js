const models = require("../models");
const asyncLib = require("async");
const jwtUtils = require("../utils/jwt.utils");
const fs = require("fs");
const { invalid, func } = require("joi");
const postRessourceSchema = require("../utils/joi/postRessourceSchema");
const updateRessourceSchema = require('../utils/joi/updateSchema');

const CONTENT_LIMIT = 5000;

module.exports = {
  postRessources: async function (req, res) {
    try {
      const valid = await postRessourceSchema.validateAsync(req.body);
      if (valid) {
        let headerAuth = req.headers["authorization"];
        let userId = jwtUtils.getUserId(headerAuth);

        let title = null
        let content = null;
        let project = null;
        let attachment = [];
        let movie = [];
        let pdf = [];
        let files = req.files;

        if (files) {
          for(let i = 0; i < files.length; i++){
            let media = req.files[i].filename;
            if (media.includes(".mp4")) {
              movie.push( `${req.protocol}://${req.get("host")}/images/${req.files[i].filename}`) ;
            }else if(media.includes('pdf')){
              pdf.push(`${req.protocol}://${req.get("host")}/images/${req.files[i].filename}`)  ;
            } else {
              attachment.push(`${req.protocol}://${req.get("host")}/images/${req.files[i].filename}`);
            }
           } 
        }

        if(req.body.title){
          title = String(req.body.title)
          if(title === null){
            return res.status(400).json({error: 'entrer un titre'});
          }
        }
        if (req.body.content) {
          content = String(req.body.content);
          if (content.length > CONTENT_LIMIT) {
            return res.status(400).json({ error: "trop de caractères" });
          }
        }
        if (req.body.project){
            project = String(req.body.project);
            if(project === null){
                return res.status(400).json({error: 'entrer un projet'});
            }
        }
        if(req.body.parcour){
          parcour = String(req.body.parcour);
          if(parcour === null){
            return res.status(400).json({error: 'parcours non renseigner'});
          }
        }

        if (content === null && project === null && attachment === null && movie === null) {
          return res.status(400).json({ error: "remplir au moins un champs" });
        }

                asyncLib.waterfall(
          [
            function (done) {
              models.User.findOne({
                where: { id: userId }
              })
                .then(function (userFound) {
                  done(null, userFound);
                })
                .catch(function(error){
                  return res.status(500).json({message: error.message});
                });
            },
            function (userFound, done) {
              if (userFound) {
                models.Ressource.create({
                  UserId: userFound.id,
                  title: title,
                  content: content,
                  project: project,
                  parcours: parcour,
                  isAdmin: false
                }).then(function (newRessource) {
                  done(newRessource);
                  if(attachment.length > 0){
                    for(let i = 0; i < attachment.length; i++){
                      models.File.create({
                      RessourceId : newRessource.id,
                      image: attachment[i]
                    })
                    }
                  }
                  if(movie.length > 0){
                    for(let i = 0; i < attachment.length; i++){
                      models.File.create({
                      RessourceId : newRessource.id,
                      image: movie[i]
                    })
                    }
                  }
                  if(attachment.length > 0){
                    for(let i = 0; i < pdf.length; i++){
                      models.File.create({
                      RessourceId : newRessource.id,
                      image: pdf[i]
                    })
                    }
                  }
  
                }).catch(function(err){
                  return res.status(404).json({message: err.message });
                })
              } else {
                res.status(404).json({ error: "user not found" });
              }
            },
          ],
          function (newRessource) {
            if (newRessource) {
              return res.status(201).json(newRessource);
            } else {
              return res.status(500).json({ error: "cannot post message" });
            }
          }
        );
      } else {
        throw error(invalid);
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  listRessourceDeveloppeurWeb: function (req, res) {
    let fields = req.query.fields;
    let order = req.query.order;

    models.Ressource.findAll({
      order: [order != null ? order.split(":") : ["id", "DESC"]], 
      attributes: fields !== "*" && fields != null ? fields.split(",") : null,
      where:{
        parcours: 'dev-web'
      },
      include: [
        {
          model: models.User,
          attributes: ["firstname", "lastname"],
        },
        {
          model: models.File,
          attributes: ["image", "movie", "pdf"]
        }
      ],
    })
      .then(function (ressource) {
        if (ressource) {
          res.status(200).json(ressource);
        } else {
          res.status(404).json({ error: "aucune ressources trouvée" });
        }
      })
      .catch(function (err) {
        res.status(500).json({ error: "invalid fields" });
      });
  },

  listRessourceDeveloppeurFrontend: function (req, res) {
    let fields = req.query.fields;
    let order = req.query.order;

    models.Ressource.findAll({
      order: [order != null ? order.split(":") : ["id", "DESC"]], 
      attributes: fields !== "*" && fields != null ? fields.split(",") : null,
      where:{
        parcours: 'dev-front'
      },
      include: [
        {
          model: models.User,
          attributes: ["firstname", "lastname"],
        },
        {
          model: models.File,
          attributes: ["image", "movie", "pdf"]
        }
      ],
    })
      .then(function (ressource) {
        if (ressource) {
          res.status(200).json(ressource);
        } else {
          res.status(404).json({ error: "aucune ressources trouvée" });
        }
      })
      .catch(function (err) {
        res.status(500).json({ error: "invalid fields" });
      });
  },

  deleteRessource: function(req,res){
    let headerAuth = req.headers["authorization"];
    let userId = jwtUtils.getUserId(headerAuth);
    let ressourceId = parseInt(req.params.ressourceId)
    console.log(ressourceId);

    if(userId <= 0){
      return res.status(400).json({error: "utilisateur non reconnu"})
    }
    if(ressourceId <= 0){
      return res.status(400).json({error: "ressource non reconnu"})
    }

    models.File.destroy({
      where : {
        RessourceId : ressourceId
      }
    })
    .then(() => {
      res.status(201).json({message : 'files supprimer'})
    })
    .catch((err) => {
      res.status(400).json({message : err.message})
    })
    
    models.Ressource.findOne({
      where:{
        userId: userId,
        id: ressourceId,
      }
    })
    .then(function(ressource){
      // if(ressource.image){
      //   const filename = ressource.image.split("/images/")[1];
      //   fs.unlink(`images/${filename}`,() =>{
      //     models.Ressource.destroy({
      //       where:{
      //         userId: userId,
      //         id: ressourceId
      //       }
      //     })
      //     .then(function(){
      //       res.status(201).json(({ok: "ressource supprimée"}))
      //     })
      //     .catch(function (err){
      //       res.status(400).json({ err });
      //     })
      //   });
      // } else if(ressource.movie){
      //   const filename = ressource.movie.split("/images/")[1];
      //   fs.unlink(`images/${filename}`,() =>{
      //     models.Ressource.destroy({
      //       where:{
      //         userId: userId,
      //         id: ressourceId
      //       }
      //     })
      //     .then(function(){
      //       res.status(201).json(({ok: "ressource supprimée"}))
      //     })
      //     .catch(function (err){
      //       res.status(400).json({ err });
      //     })
      //   });
      // } else {
        models.Ressource.destroy({
          where:{
            userId: userId,
            id: ressourceId
          }
        })
        .then(function(){
          res.status(201).json(({ok: "ressource supprimée"}))
        })
        .catch(function (err){
          res.status(400).json({ err });
        })
      
    })
    .catch(function(err){
      res.status(400).json({message : err.message});
    })
  },

  getOneRessource: function(req, res){
    let headerAuth = req.headers["authorization"];
    let userId = jwtUtils.getUserId(headerAuth);
    const ressourceId = req.params.ressourceId;


    if(userId <= 0){
      return res.status(400).json({error: `nous n'êtes pas identifié`})
    }
    models.Ressource.findOne({
      where: {id: ressourceId},
      include: [
        {
          model: models.File,
          attributes: ["id","ressourceId","image", "movie", "pdf"]
        }
      ],
    })
    .then(function(ressource){
      return res.status(200).json(ressource)
    })
    .catch(function(err){
      return res.status(400).json({error: "ressource inexistante"})
    })
  },






  modifyRessource: async function (req, res) {
    try {
      const valid = await updateRessourceSchema.validateAsync(req.body);
      if (valid) {
        let headerAuth = req.headers["authorization"];
        let userId = jwtUtils.getUserId(headerAuth);
        const ressourceId = req.params.ressourceId;

        let title = null
        let content = null;
        let project = null;
        let attachment = [];
        let movie = [];
        let pdf = [];
        let files = req.files;

        if (files) {
          models.File.destroy({
            where : {
              ressourceId : ressourceId
            }
          }).then(() => {
            res.status(200).json("files supprimées")
          })
          for(let i = 0; i < files.length; i++){
            let media = req.files[i].filename;
            if (media.includes(".mp4")) {
              movie.push( `${req.protocol}://${req.get("host")}/images/${req.files[i].filename}`) ;
            }else if(media.includes('pdf')){
              pdf.push(`${req.protocol}://${req.get("host")}/images/${req.files[i].filename}`)  ;
            } else {
              attachment.push(`${req.protocol}://${req.get("host")}/images/${req.files[i].filename}`);
              
            }
           }
        }

        console.log(req.files);


        if(req.body.title){
          title = String(req.body.title)
        }
        if (req.body.content) {
          content = String(req.body.content);
          if (content.length > CONTENT_LIMIT) {
            return res.status(400).json({ error: "trop de caractères" });
          }
        }
        if (req.body.project){
            project = String(req.body.project);
        }

        asyncLib.waterfall(
          [
            function (done) {
              models.Ressource.findOne({
                where: { id: ressourceId }
              })
                .then(function (ressourceFound) {
                  done(null, ressourceFound);
                })
                .catch(function(error){
                  return res.status(500).json({message: error.message});
                });
            },
            function (ressourceFound, done) {
              if (ressourceFound) {
                ressourceFound.update({
                title: title ? title : ressourceFound.title,
                content: content ? content : ressourceFound.content,
                project: project ? project : ressourceFound.project
                }).then(function (updateRessource) {
                  done(null, ressourceFound, updateRessource);
                }).catch(function(err){
                  return res.status(404).json({message: err.message });
                })
              } else {
                res.status(404).json({ error: "user not found" });
              }
            },
            function(ressourceFound, updateRessource, done){

              if(ressourceFound){
                for(let i = 0; i < attachment.length; i++){
                  models.File.create({
                    RessourceId : ressourceId,
                    image: attachment[i]
                  })
                  .then(function (newFile) {
                    done(userFound,newRessource ,newFile);
                  }).catch(function(err){
                    return res.status(404).json({message: err.message });
                  })
                }
                for(let i = 0; i < movie.length; i++){
                  models.File.create({
                    RessourceId : ressourceId,
                    movie: movie[i]
                  })
                }
                for(let i = 0; i < pdf.length; i++){
                  models.File.create({
                    RessourceId :ressourceId,
                    pdf: pdf[i]
                  })
                  .then(function (newRessource) {
                    done(null, userFound, newRessource);
                  }).catch(function(err){
                    return res.status(404).json({message: err.message });
                  })
                }
                
              }else {
                res.status(404).json({ error: "post not found" });
              }
            }
          ],
          function (newRessource) {
            if (newRessource) {
              return res.status(201).json({newRessource});
            } else {
              return res.status(500).json({ error: "cannot post message" });
            }
          }
        );
      } else {
        throw error(invalid);
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },


};