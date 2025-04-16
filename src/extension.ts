import * as vscode from 'vscode'
import { openFileGroup } from './openFileGroup'

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'ai-helper.openFileGroup',
    openFileGroup
  )
  context.subscriptions.push(disposable)
}

export function deactivate() {}
