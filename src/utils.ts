import * as vscode from 'vscode'

export const projectRoot =
  vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd()
