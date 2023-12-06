import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const express = require('express');

const router = express.Router();

router.get('/status', AppController.getStatus);

router.get('/stats', AppController.getStats);

router.post('/users', UsersController.postNew);

// GET /connect => AuthController.getConnect
router.get('/connect', AuthController.getConnect);

router.get('/disconnect', AuthController.getDisconnect);

router.get('/users/me', UsersController.getMe);

// POST /files should create a new file in DB and in disk
router.post('/files', FilesController.postUpload);

module.exports = router;
