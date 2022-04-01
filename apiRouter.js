//imports
const express = require('express');
const multer = require('./utils/multer-config')

const userCtrl = require('./routes/userCtrl')
const ressourceCtrl = require('./routes/ressource')
const chatCtrl = require('./routes/chat')



exports.router = (function(){ 

    const apiRouter = express.Router();

    apiRouter.route('/users/register/').post(userCtrl.register);
    apiRouter.route('/users/login/').post(userCtrl.login);
    apiRouter.route('/users/all/').get(userCtrl.getAllUser);
    apiRouter.route('/users/me').get(userCtrl.getUserProfile);
    apiRouter.route('/users/modify').put(multer, userCtrl.modifyProfile);
    apiRouter.route('/users/verification').post(userCtrl.verificationUser);
    apiRouter.route('/users/disconnect').get(userCtrl.disconnect);
    apiRouter.route('/users/delete').delete(userCtrl.deleteUser);

    apiRouter.route('/ressources/new/').post(multer,ressourceCtrl.postRessources);
    apiRouter.route('/ressources/devWeb').get(ressourceCtrl.listRessourceDeveloppeurWeb);
    apiRouter.route('/ressources/devFront').get(ressourceCtrl.listRessourceDeveloppeurFrontend);
    apiRouter.route('/ressources/deleteDevWeb/:ressourceId').delete(ressourceCtrl.deleteRessource);
    apiRouter.route('/ressources/deleteDevFront/:ressourceId').delete(ressourceCtrl.deleteRessource);
    apiRouter.route('/ressources/modifyRessource/:ressourceId').put(multer,ressourceCtrl.modifyRessource);
    apiRouter.route('/ressources/:ressourceId/').get(ressourceCtrl.getOneRessource);

    apiRouter.route('/chat/sendMessage').post(multer, chatCtrl.sendMessage);
    apiRouter.route('/chat').get(chatCtrl.listMessage);
    apiRouter.route('/chat/room').post(multer, chatCtrl.sendRoomMessage);

    return apiRouter
})();
