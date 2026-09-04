export async function deleteSurveyWithResponses(client, surveyId) {
  const { error } = await client.rpc('delete_survey_with_responses', {
    target_survey_id: surveyId,
  })

  if (error) throw error
}
