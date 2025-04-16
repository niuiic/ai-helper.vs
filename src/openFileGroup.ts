import { existsSync, readFileSync } from 'fs'
import * as vscode from 'vscode'
import { config } from './config'
import { join } from 'path'
import { projectRoot } from './utils'

interface Task {
  name: string
  input: string[]
  files: string[]
}

export const openFileGroup = async () => {
  // %% get tasks %%
  if (!existsSync(config.taskFile)) {
    vscode.window.showErrorMessage('Task file not found')
    return
  }
  const tasks: Task[] = JSON.parse(readFileSync(config.taskFile, 'utf-8'))

  // %% select task %%
  const taskName = await vscode.window.showQuickPick(tasks.map((t) => t.name))
  const task = tasks.find((x) => x.name === taskName)
  if (!task) {
    return
  }

  // %% collect input %%
  const inputs = await Promise.all(
    task.input.map((x) => vscode.window.showInputBox({ title: x }))
  )
  const taskInputs = Object.fromEntries(
    task.input.map((x, i) => [x, inputs[i]])
  )

  // %% files %%
  const taskFiles = task.files
    .map((x) => x.replace(/\$\{(.*?)\}/g, (_, x) => taskInputs[x]!))
    .map((x) => join(projectRoot, x))
  vscode.window.showWarningMessage(taskFiles.join('  \\ '))

  // %% open files %%
  taskFiles.forEach((x) =>
    vscode.window.showTextDocument(vscode.Uri.file(x), {
      preview: false,
      viewColumn: vscode.ViewColumn.Active
    })
  )
}
