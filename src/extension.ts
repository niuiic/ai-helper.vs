import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'ai-helper.openFileGroup',
    async () => {
      const input = await vscode.window.showInputBox()
      vscode.window.showErrorMessage(input ?? '')
    }
  )

  context.subscriptions.push(disposable)
}

export function deactivate() {}
