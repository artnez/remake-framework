const Handlebars = require('handlebars');
const parseUrl = require('parseurl');
import { get, set, isPlainObject } from 'lodash-es';
import forEachDeep from "deepdash-es/forEachDeep";
import { getItemWithId } from "./get-item-with-id";
import { specialDeepExtend } from "./special-deep-extend";
import getUniqueId from "./get-unique-id";
import { getUserData, setUserData } from "./user-data";
import { getPartials } from "./get-project-info";

export function initApiRoutes ({app}) {
  let partials = getPartials();

  app.post('/save', async (req, res) => {

    if (!req.isAuthenticated()) {
      res.json({success: false});
      return;
    }

    // get incoming data
    let incomingData = req.body.data;
    let savePath = req.body.path;
    let saveToId = req.body.saveToId;

    // get existing data
    let user = req.user;
    let existingData = user.appData;

    // option 1: save path
    if (savePath) {
      let dataAtPath = get(existingData, savePath); 

      if (isPlainObject(dataAtPath)) {
        // deep extend, using ids to match objects in arrays
        specialDeepExtend(dataAtPath, incomingData);
        set(existingData, savePath, incomingData);
      } else if (Array.isArray(dataAtPath)) {
        specialDeepExtend(dataAtPath, incomingData);
        set(existingData, savePath, incomingData);
      } else {
        // if we're not auto generating ids OR
        // if dataAtPath is NOT an object or array
        // replace the data the the path
        set(existingData, savePath, incomingData);
      }
    // option 2: save to id
    } else if (saveToId) {
      let itemData = getItemWithId(existingData, saveToId);
      specialDeepExtend(itemData, incomingData);
      Object.assign(itemData, incomingData);
    // option 3: extend existing data at root level
    } else {
      specialDeepExtend(existingData, incomingData);
      existingData = incomingData;
    }

    await setUserData({username: user.details.username, data: existingData, type: "appData"});

    res.json({success: true});

  })

  app.post('/new', async (req, res) => {

    if (!req.isAuthenticated()) {
      res.json({htmlString: ""});
      return;
    }

    let templateName = req.body.templateName;
    let matchingPartial = partials.find(partial => partial.name === templateName);

    // add a unique key to every plain object in the bootstrap data
    forEachDeep(matchingPartial.bootstrapData, function (value, key, parentValue, context) {
      if (isPlainObject(value) && !value.id) {
        value.id = getUniqueId();
      }
    });

    let params = req.params;
    let usernameFromParams = params.username;
    let query = req.query;
    let pathname = parseUrl(req).pathname;
    let currentUser = req.user;
    let pageOwner = await getUserData({username: usernameFromParams});
    let data = pageOwner && pageOwner.appData || {};
    let isPageOwner = currentUser && pageOwner && currentUser.details.username === pageOwner.details.username;

    let currentItem;
    let parentItem; 
    if (pageOwner) {
      let processResponse = await preProcessData({data, user: pageOwner, params, addUniqueIdsToData: true});
      currentItem = processResponse.currentItem;
      parentItem = processResponse.parentItem;
    }

    if (usernameFromParams && !pageOwner) {
      res.json({htmlString: ""});
      return;
    }

    let template = Handlebars.compile(matchingPartial.templateString);
    let htmlString = template({
      data,
      params,
      query,
      pathname,
      currentItem,
      parentItem,
      currentUser,
      pageOwner,
      isPageOwner,
      ...matchingPartial.bootstrapData
    });

    res.json({ htmlString: htmlString });
  })

}





