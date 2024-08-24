import cp from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import clack from '@clack/prompts'

export function cancelOp(): never {
  clack.cancel('Operation cancelled!')
  process.exit(0)
}

export type Template = {
  label: string
  value: string
}

export async function loadTemplates(dirPath: string): Promise<Template[]> {
  const folderNames = await fs.readdir(dirPath)
  return folderNames.map(name => ({
    label: name,
    value: path.join(dirPath, name),
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
    cp.exec(`${packageManager} --version`, (err) => {
      err ? reject() : resolve()
    })
  ))
}

export async function runCommand(command: string, args: string[], cwd?: string) {
  return new Promise<void>((resolve, reject) => {
    const process = cp.spawn(command, args, { cwd, shell: true })
    process.on('close', (code) => {
      code !== 0 ? reject() : resolve()
    })
  })
}

/** @see https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/package.json#L212 */
export function isValidPackageName(packageName: string) {
  const regex = /^(?:(?:@(?:[a-z0-9-*~][a-z0-9-*._~]*)?\/[a-z0-9-._~])|[a-z0-9-~])[a-z0-9-._~]*$/
  return regex.test(packageName)
}
