const path = require('upath');
import parseUrl from "parseurl";
import { capture } from "./async-utils";
import { getParamsFromPathname } from "./get-params-from-pathname";

function isBaseRoute ({username, itemId}) {
  return !itemId && !username;
}
function isUsernameRoute ({username, itemId}) {
  return !!username;
}
function isItemRoute ({username, itemId}) {
  return !!itemId;
}

// If a route's url is missing its app name, this gets the app name from
// the referrer url and adds it into the current route's url
function addAppNameToInvalidRequestPath ({req}) {
  // get referrer url path
  let referrerUrl = req.get('Referrer');
  let referrerUrlParsed = new URL(referrerUrl);
  let referrerUrlPath = referrerUrlParsed.pathname;

  // get params from current url
  let currentUrlPath = parseUrl(req).pathname;
  let [params] = await capture(getParamsFromPathname(referrerUrlPath));

  // add the app name from the referrer to the current url path
  let redirectPath = path.join(params.appName, currentUrlPath);
  
  return redirectPath;
}

export default {
  isBaseRoute,
  isUsernameRoute,
  isItemRoute,
  addAppNameToInvalidPath
}