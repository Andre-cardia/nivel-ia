import assert from 'node:assert/strict'
import test from 'node:test'
import { NO_AI_TOOL, toggleToolSelection } from '../src/lib/toolsSelection.js'

test('none is exclusive and a tool removes none', () => {
  assert.deepEqual(toggleToolSelection(['ChatGPT', 'Claude.ai'], NO_AI_TOOL), [NO_AI_TOOL])
  assert.deepEqual(toggleToolSelection([NO_AI_TOOL], 'ChatGPT'), ['ChatGPT'])
})

test('toggling a selected tool removes only that tool', () => {
  assert.deepEqual(toggleToolSelection(['ChatGPT', 'Claude.ai'], 'ChatGPT'), ['Claude.ai'])
})
