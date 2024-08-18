import * as childProcess from 'node:child_process'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as clack from '@clack/prompts'

export function cancelOp(): never {
  clack.cancel('Operation cancelled!')
  process.exit(0)
}

export type Template = {
  label: string
  value: string
}

export async function loadTemplates(templatePath: string): Promise<Template[]> {
  const folderNames = await fs.readdir(templatePath)
  return folderNames.map(name => ({
    label: name,
    value: path.join(templatePath, name),
  }))
}

export async function createFolder(folderPath: string) {
  const resolvedPath = path.resolve(folderPath)
  try {
    await fs.access(resolvedPath)
  }
  catch {
    await fs.mkdir(resolvedPath, { recursive: true })
  }
}

export async function copyFiles(src: string, dest: string) {
  const stats = await fs.lstat(src)
  if (stats.isDirectory()) {
    await fs.mkdir(dest, { recursive: true })
    const items = await fs.readdir(src)
    for (const item of items) {
      const srcPath = path.join(src, item)
      const destPath = path.join(dest, item)
      await copyFiles(srcPath, destPath)
    }
  }
  else if (stats.isFile()) {
    await fs.copyFile(src, dest)
  }
}

export async function checkPackageManager(packageManager: string) {
  return new Promise<void>((resolve, reject) => (
    childProcess.exec(`${packageManager} --version`, (err) => {
      if (err) reject()
      else resolve()
    })
  ))
}

export async function runCommand(command: string, args: string[], cwd?: string) {
  return new Promise<void>((resolve, reject) => {
    const process = childProcess.spawn(command, args, { cwd, shell: true })
    process.on('close', (code) => {
      code !== 0 ? reject() : resolve()
    })
  })
}
