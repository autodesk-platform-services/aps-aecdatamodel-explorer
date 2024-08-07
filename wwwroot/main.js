﻿import { initViewer, loadModel } from './viewer.js'

window.addEventListener("load", async () => {
  const signin = document.getElementById('signin');
  const urnInput = document.getElementById('modelurn');
  const projectidInput = document.getElementById('projectid');
  const viewerToggle = document.getElementById('toggleviewer');
  const viewerDiv = document.getElementById('viewer');
  const graphiqlDiv = document.getElementById('graphiql');
  const help = document.getElementById('help');
  help.onclick = showHelpDialog;
  new ResizeObserver(() => {
    viewerDiv.style.height = `calc( ${document.body.scrollHeight}px - (1em + ${graphiqlDiv.clientHeight}px))`;
    if(!!globalViewer)
      globalViewer.resize();
  }).observe(graphiqlDiv);
  initViewer(viewerDiv).then(viewer => {
    globalViewer = viewer;
  });
  viewerToggle.onclick = async (cb) => {
    try {
      if (cb.target.checked) {
        let itemId = urnInput.value;
        if (!itemId.includes('version')) {
          let versions = await (await fetch(`/api/hubs/${projectidInput.value}/contents/${itemId}/versions`)).json();
          itemId = versions[0].id;
        }
        await resizeGraphiql(graphiqlDiv, false);
        await loadNDisplayModel(graphiqlDiv, viewerDiv, globalViewer, itemId);
      }
      else {
        hideModel(viewerDiv);
        await resizeGraphiql(graphiqlDiv, true);
      }
    } catch (error) {
      showToast(`Please, ensure you're logged in and using a valid item/version ID!`);
      showHelpers('iteminput');
      showHelpers('signin');
      console.error(error);
      cb.target.checked = false;
    }
  }
  try {
    const resp = await fetch('/api/auth/profile');
    if (resp.ok) {
      const user = await resp.json();
      signin.innerText = `Sign Out (${user.name})`;
      signin.onclick = () => window.location.replace('/api/auth/signout');
    } else {
      signin.innerText = 'Sign In';
      signin.onclick = () => window.location.replace('/api/auth/signin');
    }
    signin.style.visibility = 'visible';
  } catch (err) {
    alert('Could not initialize the application. See console for more details.');
    console.error(err);
  }
})

async function showHelpDialog() {
  Swal.fire({
    title: '<strong>Helpers</strong>',
    html:
      "<ul style='list-style-type:none; font-size:medium'> <li><a target='_blank' href='//tutorials.autodesk.io/#provision-access-in-other-products'>Provision</a> the client id: <input type='text' style='font-weight:bold' value='HKVjhUXySDGLGJimolxAgDdpoCuZLlql' disabled></input> in your hub.</li> <li>Find the complete Source Code <a target='_blank' href='https://github.com/autodesk-platform-services/aps-aecdatamodel-explorer'>HERE</a></li> <li> If you prefer using your own client ID and Secret, <a href='/customcredentials.html'>CLICK HERE</a></li></ul>",
    showCloseButton: true,
    showCancelButton: false,
    focusConfirm: false,
    width: 600,
    confirmButtonText:
      '<i class="fa fa-thumbs-up"></i> OK',
  })
}

async function showToast(message) {
  Swal.fire({
    title: message,
    timer: 5000,
    toast: true,
    position: 'top',
    showConfirmButton: false
  })
}

async function resizeGraphiql(graphiqlDiv ,increase) {
  if (increase) {
    graphiqlDiv.style.height = 'calc(100% - 3em)';
  }
  else {
    graphiqlDiv.style.height = 'calc(70%)';
  }
}

async function loadNDisplayModel(graphiqlDiv, viewerDiv, viewer, urn) {
  try {
    viewerDiv.style.visibility = 'visible';
    viewerDiv.style.height = `calc( ${document.body.scrollHeight}px - (1em + ${graphiqlDiv.clientHeight}px))`;
    viewer.resize();
    loadModel(viewer, btoa(urn)).then();
  }
  catch (err) {
    console.log(`Not able to load the model: ${err}`);
  }
}

async function hideModel(viewerDiv) {
  try {
    viewerDiv.style.visibility = 'hidden';
  }
  catch (err) {
    console.log(`Not able to load the model: ${err}`);
  }
}