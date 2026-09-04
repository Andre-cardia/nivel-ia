import assert from 'node:assert/strict'
import test from 'node:test'
import { deleteSurveyWithResponses } from '../src/lib/deleteSurvey.js'

test('calls the permanent survey deletion RPC with the survey id', async () => {
  let functionName
  let args
  const client = {
    rpc: async (name, parameters) => {
      functionName = name
      args = parameters
      return { error: null }
    },
  }

  await deleteSurveyWithResponses(client, 'survey-123')

  assert.equal(functionName, 'delete_survey_with_responses')
  assert.deepEqual(args, { target_survey_id: 'survey-123' })
})

test('propagates an RPC failure so the interface keeps the survey visible', async () => {
  const error = new Error('permission denied')
  const client = { rpc: async () => ({ error }) }

  await assert.rejects(() => deleteSurveyWithResponses(client, 'survey-123'), error)
})
