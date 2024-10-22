#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as clack from '@clack/prompts'
import arg from 'arg'
import pc from 'picocolors'

import cliPkg from '~/package.json'
import { cancelOp, checkPackageManager, copyFiles, createFolder, isValidPackageName, loadTemplates, runCommand, type Template } from '@/utils'

async function main() {
  const args = arg({
    '--project-name': String,
    '--template': String,
    '--help': Boolean,
    '--version': Boolean,
    '--skip-install': Boolean,
    '--package-manager': String,

    // alias
    '-p': '--project-name',
    '-t': '--template',
    '-h': '--help',
    '-v': '--version',
    '-s': '--skip-install',
    '-m': '--package-manager',
  }, { permissive: true })

  if (args['--version']) {
    console.log(`v${cliPkg.version}`)
    process.exit(0)
  }

  if (args['--help']) {
    console.log('Usage: create-app [options]\n')
    console.log('Options:')
    console.log('-p,  --project-name           Project name to be used.')
    console.log('-t,  --template               Name of the template to use.')
    console.log('-h,  --help                   Show how to use the cli.')
    console.log('-v,  --version                Show the current version of the cli.')
    console.log('-s,  --skip-install-deps      Skip install dependencies.')
    console.log('-m,  --package-manager        Select the package manager, the default is npm.')
    process.exit(0)
  }

  let projectName: string | symbol | undefined = args['--project-name']

  clack.intro(pc.blue(`${cliPkg.name} v${cliPkg.version}`))

  const cwd = process.cwd()

  if (!projectName) {
    projectName = await (clack.text({
      message: 'Your project name:',
      placeholder: 'project',
      validate: (value) => {
        if (value.length === 0) return 'Project name is required!'
        if (!isValidPackageName(path.basename(value))) return 'Project name is invalid!'
      },
    }))
    if (clack.isCancel(projectName)) cancelOp()
  }

  const projectPath = path.resolve(cwd, projectName)
  projectName = path.basename(projectPath)

  let templates: Template[] = []

  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    templates = await loadTemplates(path.resolve(__dirname, '../templates'))
  }
  catch (err) {
    clack.log.error('Loading templates failed!')
    err instanceof Error && clack.log.info(err.message)
    process.exit(1)
  }

  const templateIndex = templates.findIndex(t => t.label === args['--template'])

  if (args['--template'] && templateIndex === -1) {
    clack.log.error(`'${args['--template']}' isn\'t a valid template.`)
    process.exit(1)
  }

  let templatePath: string | symbol | undefined = templates?.[templateIndex]?.value ?? undefined

  if (!templatePath) {
    templatePath = await clack.select({
      message: 'Select template:',
      options: templates,
      initialValue: templates[0].value,
    })
    if (clack.isCancel(templatePath)) cancelOp()
  }

  const spinner = clack.spinner()

  try {
    spinner.start('Copying files...')
    await createFolder(projectPath)
    await copyFiles(templatePath, projectPath)
  }
  catch (err) {
    clack.log.error('Copying files failed!')
    err instanceof Error && clack.log.info(err.message)
    process.exit(1)
  }
  finally {
    spinner.stop('Copying files succeeded!')
  }

  // overwrite files
  try {
    // rename package name
    const pkgPath = path.join(projectPath, 'package.json')
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))
    pkg.name = projectName
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

    // rename gitignore
    const oldPath = path.join(projectPath, '_gitignore')
    const newPath = path.join(projectPath, '.gitignore')
    await fs.rename(oldPath, newPath)
  }
  catch (err) {
    clack.log.error(`Overwriting files failed!`)
    err instanceof Error && clack.log.info(err.message)
    process.exit(1)
  }

  if (args['--skip-install']) {
    clack.outro('done.')
    process.exit(0)
  }

  const packageManagers = ['npm', 'yarn', 'pnpm', 'bun']

  let packageManager: string | symbol | undefined = args['--package-manager']

  if (args['--package-manager'] && !packageManagers.includes(args['--package-manager'])) {
    clack.log.error(`'${args['--package-manager']}' isn\'t a valid package manager.`)
    process.exit(1)
  }

  if (!packageManager) {
    const isInstallDeps = await clack.confirm({
      message: 'Installing dependencies now?',
      active: 'yes',
      inactive: 'no',
      initialValue: true,
    })
    if (clack.isCancel(isInstallDeps)) cancelOp()

    if (!isInstallDeps) {
      clack.outro('done.')
      process.exit(0)
    }
  }

  if (!packageManager) {
    packageManager = await clack.select({
      message: 'Select package manager:',
      options: packageManagers.map(value => ({ value })),
      initialValue: 'npm',
    })
    if (clack.isCancel(packageManager)) cancelOp()
  }

  // check package manager exists
  try {
    await checkPackageManager(packageManager)
  }
  catch (err) {
    clack.log.error(`You haven't installed the ${packageManager} package manager!`)
    err instanceof Error && clack.log.info(err.message)
    process.exit(1)
  }

  try {
    spinner.start('Installing dependencies...')
    await runCommand(packageManager, ['install'], projectPath)
  }
  catch (err) {
    clack.log.error('Installing dependencies failed!')
    err instanceof Error && clack.log.info(err.message)
    process.exit(1)
  }
  finally {
    spinner.stop('Installing dependencies succeeded!')
  }

  clack.outro('done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
