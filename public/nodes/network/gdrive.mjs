import NodeWork from "../../nodework.mjs";
import { NodiEnums } from "../../enums.mjs";
import { WindowSharp } from "@mui/icons-material";
 // Discovery doc URL for APIs used by the quickstart
 const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

 // Authorization scopes required by the API; multiple scopes can be
 // included, separated by spaces.
 const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';
 /**
  *  Sign out the user upon button click.
  */
 function handleSignoutClick() {
   const token = window.gapi.client.getToken();
   if (token !== null) {
     window.google.accounts.oauth2.revoke(token.access_token);
     window.gapi.client.setToken('');
     document.getElementById('content').innerText = '';
     document.getElementById('authorize_button').innerText = 'Authorize';
     document.getElementById('signout_button').style.visibility = 'hidden';
   }
 }

 window.tokenClient = null;
 let gapiInited = false;
 let gisInited = false;
 
 /**
  * Callback after the API client is loaded. Loads the
  * discovery doc to initialize the API.
  */
 async function initializeGapiClient() {
   await window.gapi.client.init({
     apiKey: API_KEY,
     discoveryDocs: [DISCOVERY_DOC],
   });
   gapiInited = true;
 }

 /**
  * Callback after api.js is loaded.
  */
  window.gapiLoaded = () => {
    window.gapi.load('client', initializeGapiClient);
 }

 /**
  * Callback after Google Identity Services are loaded.
  */
 window.gisLoaded = () => {
   window.tokenClient = window.google.accounts.oauth2.initTokenClient({
     client_id: CLIENT_ID,
     scope: SCOPES,
     callback: '', // defined later
   });
   gisInited = true;
 }

export default class GDrive extends NodeWork {
  static type = "network/gdrive";
  static title = "GDrive";

  static onDrawForeground(node, ctx) {
    ctx.drawImage(GDrive.icon, 0, 0, 128, 128,  8, 8, 48, 48)
    if (node?.file?.name) {
      ctx.fillText(node.file.name, node.size[0] * 0.5, 10);
    }

  }

  static setup(node) {
    if (node.file == null) node.file = {}

    if (node.file.id == null) node.file.id = 'root'
    NodeWork.clear(node);

    let props = node.properties;
    window.tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw (resp);
      }
      // Save refresh token securely (example with localStorage)
      localStorage.setItem('refresh_token', resp.refresh_token);
      await GDrive.listFiles(node);
    };

    if (window.gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      window.tokenClient.requestAccessToken({prompt: 'consent'});
    } 
    
  }

  /**
     * Print metadata for first 10 files.
     */
  static async listFiles(node){
    let response;
    try {
      let query = `"${node.file.id}" in parents and trashed = false`;
      response = await window.gapi.client.drive.files.list({
        'pageSize': 100,
        'fields': 'files(id, driveId, name, kind, iconLink, parents, thumbnailLink, webViewLink, mimeType)',
        'q': query
      });
    } catch (err) {
      console.dlog(err.message);
      return;
    }
    const files = response.result.files;
    if (!files || files.length == 0) {
      console.dlog('No files found.');
      return;
    }
    let p = 0;
    for (let file of files) {
      let msg = {};
      msg.node = {};
      NodeWork.clear(msg.node);
      msg.node.file = file;
      msg.node.icon = new Image(64, 64);
      msg.node.icon.src = file.iconLink.replace("16","64");

      msg.node.size = [1, 1]
      if (file.mimeType == "application/vnd.google-apps.folder") {
        msg.node.type = "network/gdrive"
      } else {
        msg.node.type = "network/gdrivefile"
      }
      msg.node.nodeID = NodeWork.getFirstNullIndex(node?.nodes);
      //NodeWork.getNodeType(msg.node.type).setup(msg.node);
      msg.pos = [0, p++];
      NodeWork.addNode(node, msg);
    }
    // Flatten to string to display
    const output = files.reduce(
        (str, file) => `${str}${file.name} (${file.id})\n`,
        'Files:\n');
        console.dlog(output);
}

  static run(node) {
    let ret = [];
    return ret;
  }

  static onMouseUp(node) {
    GDrive.listFiles(node);
    window.currentNodeWork = node;
    window.showParent(true);
    return true;
  }
}
GDrive.icon = new Image(64, 64);
GDrive.icon.src = "https://fonts.gstatic.com/s/i/productlogos/drive_2020q4/v8/web-64dp/logo_drive_2020q4_color_2x_web_64dp.png"
NodeWork.registerNodeType(GDrive);
