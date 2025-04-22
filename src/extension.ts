import * as vscode from 'vscode'
import { execTask } from './execTask'

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'ai-helper.execTask',
    execTask
  )
  context.subscriptions.push(disposable)
}

export function deactivate() {}
