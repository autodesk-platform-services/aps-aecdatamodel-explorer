class AIMFilterExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._button = null;
    this._onObjectTreeCreated = (ev) => this.onModelLoaded(ev.model);
  }

  async onModelLoaded(model) {
    this.leafNodes = await this.findLeafNodes(model);
  }

  load() {
    this.viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, this._onObjectTreeCreated);
    return true;
  }

  unload() {
    if (this._button) {
      this.removeToolbarButton(this._button);
      this._button = null;
    }
    return true;
  }

  onToolbarCreated() {
    this._button = this.createToolbarButton('aimfilterextension-button', 'https://img.icons8.com/ios-glyphs/30/null/empty-filter.png', 'Filter Model Based on Query');
    this._button.onClick = this.filterModel.bind(this);
  }

  async filterModel() {
    let externalIds = await this.retrieveOccurences(queryResponse);
    this.dbidsFromExternalIds(externalIds);
  }

  findLeafNodes(model) {
    return new Promise(function (resolve, reject) {
      model.getObjectTree(function (tree) {
        let leaves = [];
        tree.enumNodeChildren(tree.getRootId(), function (dbid) {
          if (tree.getChildCount(dbid) === 0) {
            leaves.push(dbid);
          }
        }, true /* recursively enumerate children's children as well */);
        resolve(leaves);
      }, reject);
    });
  }

  async dbidsFromExternalIds(externalIds) {
    this.viewer.model.getExternalIdMapping((externalIdsDictionary) => {
      let dbids = [];
      externalIds.forEach(externalId => {
        let dbid = externalIdsDictionary[externalId];
        if (!!dbid)
          dbids.push(dbid);
      });
      let leafNodesIds = dbids.filter(dbid => this.leafNodes.includes(dbid));
      this.viewer.isolate(leafNodesIds);
      this.viewer.fitToView();
    }, console.log)
  }

  async retrieveOccurences(jsonResponse) {
    //Here we use a regex to handle the json as an array of strings
    let stringArrayResponse = JSON.stringify(jsonResponse).replace(/{|}|\[|\]/g, '|').split('|');
    let sourceIdIndex = stringArrayResponse.findIndex(s => s.includes('sourceId'));
    let externalIds = [];
    while (sourceIdIndex != -1) {
      externalIds.push(JSON.parse(`{${stringArrayResponse[sourceIdIndex]}}`).value);
      stringArrayResponse.splice(sourceIdIndex, 1);
      sourceIdIndex = stringArrayResponse.findIndex(s => s.includes('sourceId'));
    }
    return externalIds.filter(i => !!i);
  }

  createToolbarButton(buttonId, buttonIconUrl, buttonTooltip) {
    let group = this.viewer.toolbar.getControl('aim-toolbar-group');
    if (!group) {
      group = new Autodesk.Viewing.UI.ControlGroup('aim-toolbar-group');
      this.viewer.toolbar.addControl(group);
    }
    const button = new Autodesk.Viewing.UI.Button(buttonId);
    button.setToolTip(buttonTooltip);
    group.addControl(button);
    const icon = button.container.querySelector('.adsk-button-icon');
    if (icon) {
      icon.style.backgroundImage = `url(${buttonIconUrl})`;
      icon.style.backgroundSize = `24px`;
      icon.style.backgroundRepeat = `no-repeat`;
      icon.style.backgroundPosition = `center`;
    }
    return button;
  }

  removeToolbarButton(button) {
    const group = this.viewer.toolbar.getControl('aim-toolbar-group');
    group.removeControl(button);
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension('AIMFilterExtension', AIMFilterExtension);