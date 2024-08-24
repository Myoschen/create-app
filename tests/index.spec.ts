import { spawnSync, type SpawnSyncOptions } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeAll, expect, test } from 'vitest'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// vars
const cliPath = path.join(__dirname, '../dist')
const projectName = 'test-project'
const projectPath = path.join(__dirname, projectName)
const templateName = 'node'
// const templateFiles = fs.readdirSync(path.join(cliPath, 'templates', templateName)).sort()

// utils
function run(args: string[], options?: SpawnSyncOptions) {
  return spawnSync('node', [cliPath, ...args], { encoding: 'utf-8', ...options })
}

// hooks
beforeAll(() => {
  fs.rmSync(projectPath, { recursive: true, force: true })
})

afterEach(() => {
  fs.rmSync(projectPath, { recursive: true, force: true })
})

// tests
test('return cli version', () => {
  const { stdout } = run(['--version'])
  const message = 'v0.0.1'
  expect(stdout).toContain(message)
})

test('return cli version (alias)', () => {
  const { stdout } = run(['-v'])
  const message = 'v0.0.1'
  expect(stdout).toContain(message)
})

test('return usage', () => {
  const { stdout } = run(['--help'])
  const message = 'Usage: create-app [options]'
  expect(stdout).toContain(message)
})

test('return usage (alias)', () => {
  const { stdout } = run(['-h'])
  const message = 'Usage: create-app [options]'
  expect(stdout).toContain(message)
})

test('prompts for the project name if not provided', () => {
  const { stdout } = run([])
  const message = 'Your project name:'
  expect(stdout).toContain(message)
})

test('prompts for the template if not provided', () => {
  const { stdout } = run(['--project-name', projectName])
  const message = 'Select template:'
  expect(stdout).toContain(message)
})

test('prompts for the template if not provided (alias)', () => {
  const { stdout } = run(['-p', projectName])
  const message = 'Select template:'
  expect(stdout).toContain(message)
})

test('prompts for the template on providing invalid template', () => {
  const { stdout, status } = run(['-p', projectName, '-t', 'unknown'])
  const message = '\'unknown\' isn\'t a valid template.'
  expect(stdout).toContain(message)
  expect(status).toBe(1)
})

test('successfully scaffolds a project', () => {
  const { stdout } = run(['-p', projectName, '-t', templateName], { cwd: __dirname })
  const message = 'Installing dependencies now?'
  expect(stdout).toContain(message)
})

test('successfully overwrites package name', () => {
  run(['-p', projectName, '-t', templateName], { cwd: __dirname })
  const pkg = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), { encoding: 'utf-8' }))
  expect(pkg.name).toContain(projectName)
})

test('successfully scaffolds a project on skipping install deps', () => {
  const { stdout } = run(['-p', projectName, '-t', templateName, '-s'], { cwd: __dirname })
  const message = 'done.'
  expect(stdout).toContain(message)
})

test('installing deps on providing invalid package manager', () => {
  const { stdout } = run(['-p', projectName, '-t', templateName, '-m', 'unknown'], { cwd: __dirname })
  const message = '\'unknown\' isn\'t a valid package manager.'
  expect(stdout).toContain(message)
})

test('successfully installs deps', () => {
  run(['-p', projectName, '-t', templateName, '-m', 'npm'], { cwd: __dirname })
  const files = fs.readdirSync(projectPath)
  expect(files).toContain('package-lock.json')
})
