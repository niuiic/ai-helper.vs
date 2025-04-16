import { existsSync, readFileSync } from 'fs'
import * as vscode from 'vscode'
import { config } from './config'
import { join } from 'path'
import { projectRoot } from './utils'
import { Option, optionSchema } from './option'

export const openFileGroup = async () => {
  // %% get option %%
  if (!existsSync(config.taskFile)) {
    vscode.window.showErrorMessage('Task file not found')
    return
  }
  let option: Option
  try {
    option = optionSchema.parse(
      JSON.parse(readFileSync(config.taskFile, 'utf-8'))
    )
  } catch (e) {
    vscode.window.showErrorMessage(JSON.stringify(e))
    return
  }

  // %% select task %%
  const taskName = await vscode.window.showQuickPick(
    option.tasks.map((t) => t.name)
  )
  const task = option.tasks.find((x) => x.name === taskName)
  if (!task) {
    return
  }

  // %% collect input %%
  let inputs: Record<string, string> = {}
  const transformInput = (source: string, method: string) =>
    source.slice(0, 1).toUpperCase() + source.slice(1)
  for (const x of task.input) {
    if (typeof x === 'string') {
      inputs[x] = (await vscode.window.showInputBox({ title: x })) ?? ''
    } else {
      inputs[x.name] = inputs[x.source]
        ? transformInput(inputs[x.source], x.transform)
        : ''
    }
  }

  // %% files %%
  const taskFiles = task.files
    .map((x) => x.replace(/\$\{(.*?)\}/g, (_, x) => inputs[x]!))
    .map((x) => join(projectRoot, x))

  // %% open files %%
  taskFiles.forEach((x) =>
    vscode.window.showTextDocument(vscode.Uri.file(x), {
      preview: false,
      viewColumn: vscode.ViewColumn.Active
    })
  )
}
