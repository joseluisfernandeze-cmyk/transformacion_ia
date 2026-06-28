function PromptRepository_findActiveById(promptId) {
  var prompt = SheetRepository_findOneBy("PROMPTS", "promptId", promptId);
  return prompt && String(prompt.isActive).toUpperCase() === "TRUE" ? prompt : null;
}

