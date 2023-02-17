/// import * as Autodesk from "@types/forge-viewer";
import './AIMFilterExtension.js'

async function getAccessToken(callback) {
  try {
    const resp = await fetch('/api/auth/token');
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    const { access_token, expires_in } = await resp.json();
    callback(access_token, expires_in);
  } catch (err) {
    //alert('Could not obtain access token. See the console for more details.');
    console.error(err);
  }
}

export function initViewer(container) {
  return new Promise(function (resolve, reject) {
    Autodesk.Viewing.Initializer({ getAccessToken }, async function () {
      const config = {
        extensions: [
          'AIMFilterExtension',
          'Autodesk.DocumentBrowser'
        ]
      }
      const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
      viewer.start();
      viewer.setTheme('light-theme');
      resolve(viewer);
    });
  });
}

export function loadModel(viewer, urn) {
  function onDocumentLoadSuccess(doc) {
    var masterViews = findMasterViews(doc.getRoot().findAllViewables()[0]);
    viewer.loadDocumentNode(doc,  /* if any master view */ masterViews.length !== 0 ? /* use first */ masterViews[0] : /* or use default */ doc.getRoot().getDefaultGeometry()).then(i => {
      // documented loaded, any action?
    });
  }
  function findMasterViews(viewable) {
    var masterViews = [];
    // master views are under the "folder" with this UUID
    if (viewable.data.type === 'folder' && viewable.data.name === '08f99ae5-b8be-4f8d-881b-128675723c10') {
      return viewable.children;
    }
    if (viewable.children === undefined) return;
    viewable.children.forEach((children) => {
      var mv = findMasterViews(children);
      if (mv === undefined || mv.length == 0) return;
      masterViews = masterViews.concat(mv);
    })
    return masterViews;
  }
  function onDocumentLoadFailure(code, message) {
    alert('Could not load model. See console for more details.');
    console.error(message);
  }
  Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
}