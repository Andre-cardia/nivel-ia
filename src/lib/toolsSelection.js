export const NO_AI_TOOL = 'Não utilizo nenhuma'
export const OTHER_AI_TOOL = 'Outras'

export function toggleToolSelection(selectedTools, tool) {
  if (tool === NO_AI_TOOL) return selectedTools.includes(tool) ? [] : [tool]
  const selectable = selectedTools.filter(selectedTool => selectedTool !== NO_AI_TOOL)
  return selectable.includes(tool)
    ? selectable.filter(selectedTool => selectedTool !== tool)
    : [...selectable, tool]
}
