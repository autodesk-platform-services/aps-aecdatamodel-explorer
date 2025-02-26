// https://git.autodesk.com/forge/otto-chatbot-ui/tree/aec_explorer_integration
import './dependencies/otto/aec-datamodel-explorer-otto-chat.umd.js'
const OttoChat = AECDataModelExplorerOttoChat.OttoChat;

window.AECDataModelExplorerOttoChat.getBearerToken = async () => {
  // There most likely a cleaner way to pass this to the react component
  // but with the time constraints, this will do for now.
  const res = await fetch(`api/auth/token`);
  return res.json();
}

window.addEventListener("load", async () => {
  ReactDOM.render(
    React.createElement(OttoChat),
    document.getElementById('ottochat'),
  );
});
