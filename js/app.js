//@format
/*globals Blockly*/

import {byId, setDisplay, ct} from './dom.js';
import {setup as setupHS} from './hs.js';
import {setup as setupBS} from './bs.js';
import {getBlockListFromBlock} from './blockly.js';
import {readFirstInputFileAsText} from './file.js';
import {downloadAs} from './download.js';

function onWorkspaceUpdate(_e, workspace, targetDomNode, editor) {
  targetDomNode.innerHTML = '';
  workspace.getTopBlocks(true).forEach((block, _i, _it) =>
    getBlockListFromBlock(block).forEach((childBlock, _j, _it1) => {
      targetDomNode.appendChild(childBlock.hsToDom().toDom(0));
      targetDomNode.appendChild(ct('\n\n'));
    })
  );

  editor.setValue(targetDomNode.innerHTML);
}

function exportWorkspace(workspace) {
  const xmlDom = Blockly.Xml.workspaceToDom(workspace),
    xmlText = Blockly.Xml.domToText(xmlDom);

  downloadAs(
    xmlText,
    'bloques-' + new Date().toISOString().replace(/[: .]/g, '-') + '.bloques',
    'application/xml'
  );
}

function importWorkspace(workspace, input) {
  readFirstInputFileAsText(input, xmlText => {
    const xmlDom = Blockly.Xml.textToDom(xmlText);
    Blockly.Xml.domToWorkspace(xmlDom, workspace);
  });
}

function hideAndShow(toHide, toShow) {
  toHide.forEach(node => setDisplay(node, 'none'));
  setDisplay(toShow, 'block');
}

function activeTab(toActivate, toDeactivate) {
  toActivate.className = 'nav-link active';
  toDeactivate.forEach(node => (node.className = 'nav-link'));
}

let editor = null;
function main() {
  const workspace = Blockly.inject('blocklyDiv', {
      media: './media/',
      toolbox: byId('toolbox')
    }),
    targetDomNode = byId('targetDOM'),
    targetHTMLNode = byId('targetHTML'),
    fileSectionNode = byId('fileSection'),
    tabPagina = byId('tabPagina'),
    tabFile = byId('tabFile'),
    tabHTML = byId('tabHTML'),
    exportBtn = byId('export'),
    importBtn = byId('import'),
    fileImport = byId('file-import');

  workspace.addChangeListener(e =>
    onWorkspaceUpdate(e, workspace, targetDomNode, editor)
  );
  setupHS(Blockly);
  setupBS(Blockly);

  tabPagina.addEventListener('click', _ => {
    hideAndShow([targetHTMLNode, fileSectionNode], targetDomNode);
    activeTab(tabPagina, [tabHTML, tabFile]);
  });

  tabHTML.addEventListener('click', _ => {
    hideAndShow([targetDomNode, fileSectionNode], targetHTMLNode);
    activeTab(tabHTML, [tabPagina, tabFile]);
  });

  tabFile.addEventListener('click', _ => {
    hideAndShow([targetHTMLNode, targetDomNode], fileSectionNode);
    activeTab(tabFile, [tabHTML, tabPagina]);
  });

  exportBtn.addEventListener('click', _ => exportWorkspace(workspace));
  importBtn.addEventListener('click', _ =>
    importWorkspace(workspace, fileImport)
  );
}

window.appOnEditorLoaded = function(ed, node) {
  editor = ed;
  node.style.display = 'none';
};
main();
