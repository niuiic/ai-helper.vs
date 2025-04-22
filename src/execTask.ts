import { existsSync, readFileSync } from 'fs'
import * as vscode from 'vscode'
import { config } from './config'
import { Option, optionSchema } from './option'
import { join } from 'path'
import { projectRoot } from './utils'

export const execTask = async () => {
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
    option.tasks.map((x) => x.name)
  )
  const task = option.tasks.find((x) => x.name === taskName)
  if (!task) {
    return
  }

  // %% collect input %%
  const inputs: Record<string, string> = {}
  for (const x of task.input) {
    if (x.method === 'input') {
      inputs[x.name] =
        (await vscode.window.showInputBox({ title: x.name })) ?? ''
      continue
    }

    if (x.method === 'select') {
      if (!x.from) {
        vscode.window.showErrorMessage(
          `input field ${x.name} missing "from" property`
        )
        return
      }
      if (!option.vars[x.from]) {
        vscode.window.showErrorMessage(`vars missing field ${x.from}`)
        return
      }

      inputs[x.name] =
        (await vscode.window.showQuickPick(option.vars[x.from])) ?? ''
    }

    if (x.method === 'transform') {
      if (!x.from) {
        vscode.window.showErrorMessage(
          `input field ${x.name} missing "from" property`
        )
        return
      }
      if (!inputs[x.from]) {
        vscode.window.showErrorMessage(
          `input field ${x.from} not found in inputs`
        )
        return
      }
      if (!x.transform) {
        vscode.window.showErrorMessage(
          `input field ${x.name} missing "transform" property`
        )
        return
      }

      inputs[x.name] = transformInput(inputs[x.from], x.transform)
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

  // %% copy chart %%
  if (task.chart) {
    const chart = task.chart.replace(/\$\{(.*?)\}/g, (_, x) => inputs[x]!)
    await vscode.env.clipboard.writeText(chart)
  }
}

const transformInput = (source: string, method: string) =>
  method === 'upper' ? source.slice(0, 1).toUpperCase() + source.slice(1) : ''
