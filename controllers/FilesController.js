// const { ObjectId } = require('mongodb');
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';

const fs = require('fs').promises;
const path = require('path');
const { UserFromXToken } = require('./UsersController');

// environmental variables.
let filePath = process.env.FOLDER_PATH;
const altFilePath = '/tmp/files_manager';
const acceptedType = ['folder', 'file', 'image'];

if (!filePath) {
  filePath = altFilePath;
}

async function doesFolderExist(folderPath) {
  try {
    await fs.promises.access(folderPath);
  } catch (error) {
    // creating d folder if it doesn't exist.
    await fs.promises.mkdir(folderPath, { recursive: true });
  }
}
async function checkUserToken(userToken) {
  if (!userToken) {
    return null;
  }
  const userObj = await UserFromXToken(userToken);
  if (!userObj) {
    return null;
  }
  return userObj;
}

export default class FilesController {
  static async postUpload(req, res) {
    const token = await req.get('X-Token');
    const { name, type, data } = await req.body;

    const usersObj = await checkUserToken(token);
    if (!usersObj) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let { parentId, isPublic } = await req.body;
    if (!parentId) {
      parentId = 0;
    }
    if (!isPublic) {
      isPublic = false;
    }

    if (!name) {
      res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !acceptedType.includes(type)) {
      res.status(400).json({ error: 'Missing type' });
      return;
    }

    if (!data && type !== acceptedType.folder) {
      res.status(400).json({ error: 'Missing data' });
      return;
    }

    if (parentId) {
      // const objId = new ObjectId(parentId);
      const result = await dbClient.getTheParent(parentId, usersObj);// coming back to the function.
      if (!result) {
        res.status(400).json({ error: 'Parent not found' });
        return;
      }
      // check weda if type is a folder or not.
      if (result.type !== acceptedType.folder) {
        res.status(400).json({ error: 'Parent is not a folder' });
        return;
      }
    }
    if (type === 'folder') {
      const folderObj = {
        userId: usersObj._id,
        name,
        type,
        isPublic,
        parentId,
      };

      const newFileDoc = await dbClient.createNewFile(folderObj);
      if (newFileDoc) {
        res.status(201).json({
          id: newFileDoc.insertedId,
          name,
          type,
          isPublic,
          parentId,
          userId: usersObj._id,
        });
        return;
      }
      res.sendStatus(501);
      return;
    }
    const fileName = uuidv4();
    await doesFolderExist(filePath);
    const localPathAttr = path.join(filePath, fileName);

    const dataBase64 = Buffer.from(data, 'base64');
    await fs.writeFileAsync(localPathAttr, dataBase64, 'utf-8');
    try {
      const objStored = {
        userId: usersObj._id,
        name,
        type,
        isPublic,
        parentId,
        localPath: localPathAttr,
      };
      const result = await dbClient.createNewFile(objStored);
      res.status(201).json({
        id: result.insertedId,
        name,
        type,
        isPublic,
        parentId,
        userId: usersObj._id,
      });
      return;
    } catch (error) {
      res.status(500).json({ error: 'Cannot write data to the file' });
      throw error;
    }
  }
}
