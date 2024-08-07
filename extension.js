const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const snippetsFilePath = path.join(__dirname, 'snippets.json');

function loadSnippetsFromFile() {
  if (fs.existsSync(snippetsFilePath)) {
    const data = fs.readFileSync(snippetsFilePath, 'utf8');
    return JSON.parse(data);
  }
  return {};
}

function saveSnippetsToFile(snippets) {
  fs.writeFileSync(snippetsFilePath, JSON.stringify(snippets, null, 2));
}

function activate(context) {
  let snippets = loadSnippetsFromFile();

  let createSnippet = vscode.commands.registerCommand('extension.createSnippet', async () => {
    const prefix = await vscode.window.showInputBox({ placeHolder: 'Enter snippet prefix' });
    if (!prefix) return;

    const snippet = await vscode.window.showInputBox({ placeHolder: 'Enter snippet content' });
    if (!snippet) return;

    // Save the snippet as is
    snippets[prefix] = snippet;
    saveSnippetsToFile(snippets);
    vscode.window.showInformationMessage(`Snippet saved with prefix: ${prefix}`);
  });

  let insertSnippet = vscode.commands.registerCommand('extension.insertSnippet', async () => {
    const prefix = await vscode.window.showInputBox({ placeHolder: 'Enter snippet prefix to insert' });
    if (!prefix || !snippets[prefix]) {
      vscode.window.showErrorMessage('Snippet not found!');
      return;
    }
  
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      editor.edit(editBuilder => {
        const startPosition = editor.selection.active;
        editBuilder.insert(startPosition, snippets[prefix]);
        const endPosition = startPosition.translate(0, snippets[prefix].length);
        const newSelection = new vscode.Selection(startPosition, endPosition);
        editor.selection = newSelection;
      });
  
      // Trigger code formatting
      vscode.commands.executeCommand('prettier.formatDocument');
    }
  });
  

  context.subscriptions.push(createSnippet, insertSnippet);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
