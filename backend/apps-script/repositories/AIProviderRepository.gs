function AIProviderRepository_findProviderForAgent(agent) {
  if (agent.providerId) {
    var provider = SheetRepository_findOneBy("AI_PROVIDERS", "providerId", agent.providerId);
    return AIProviderRepository_isActive(provider) ? provider : null;
  }

  var providers = SheetRepository_getRecords("AI_PROVIDERS");
  return providers.find(function(provider) {
    return AIProviderRepository_isActive(provider);
  }) || null;
}

function AIProviderRepository_isActive(provider) {
  return provider && String(provider.isActive).toUpperCase() === "TRUE";
}

