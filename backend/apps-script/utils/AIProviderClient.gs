function AIProviderClient_execute(provider, finalPrompt) {
  var providerCode = String(provider.providerCode || "").toUpperCase();

  if (providerCode === "OPENAI") {
    return AIProviderClient_executeOpenAI(provider, finalPrompt);
  }

  if (providerCode === "CLAUDE") {
    return AIProviderClient_executeClaude(provider, finalPrompt);
  }

  if (providerCode === "GEMINI") {
    return AIProviderClient_executeGemini(provider, finalPrompt);
  }

  if (providerCode === "DEEPSEEK") {
    return AIProviderClient_executeOpenAICompatible(provider, finalPrompt, provider.baseUrl || "https://api.deepseek.com/chat/completions");
  }

  if (providerCode === "CUSTOM") {
    return AIProviderClient_executeOpenAICompatible(provider, finalPrompt, provider.baseUrl);
  }

  throw AppError_create("AI_PROVIDER_UNSUPPORTED", "AI provider is not supported.");
}

function AIProviderClient_executeOpenAI(provider, finalPrompt) {
  return AIProviderClient_executeOpenAICompatible(provider, finalPrompt, provider.baseUrl || "https://api.openai.com/v1/chat/completions");
}

function AIProviderClient_executeOpenAICompatible(provider, finalPrompt, url) {
  if (!url) {
    throw AppError_create("AI_PROVIDER_CONFIG_ERROR", "Provider baseUrl is required.");
  }

  var response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + provider.apiKey
    },
    payload: JSON.stringify({
      model: provider.model,
      temperature: Number(provider.temperature || 0.2),
      max_tokens: Number(provider.maxTokens || 1200),
      messages: [{ role: "user", content: finalPrompt }]
    }),
    muteHttpExceptions: true
  });

  return AIProviderClient_parseJsonText_(AIProviderClient_extractOpenAIText_(response));
}

function AIProviderClient_executeClaude(provider, finalPrompt) {
  var response = UrlFetchApp.fetch(provider.baseUrl || "https://api.anthropic.com/v1/messages", {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-api-key": provider.apiKey,
      "anthropic-version": "2023-06-01"
    },
    payload: JSON.stringify({
      model: provider.model,
      max_tokens: Number(provider.maxTokens || 1200),
      temperature: Number(provider.temperature || 0.2),
      messages: [{ role: "user", content: finalPrompt }]
    }),
    muteHttpExceptions: true
  });

  var body = JSON.parse(response.getContentText());
  var text = body.content && body.content[0] ? body.content[0].text : "";
  return AIProviderClient_parseJsonText_(text);
}

function AIProviderClient_executeGemini(provider, finalPrompt) {
  var url = provider.baseUrl || "https://generativelanguage.googleapis.com/v1beta/models/" + provider.model + ":generateContent";
  var response = UrlFetchApp.fetch(url + "?key=" + encodeURIComponent(provider.apiKey), {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      generationConfig: {
        temperature: Number(provider.temperature || 0.2),
        maxOutputTokens: Number(provider.maxTokens || 1200)
      },
      contents: [{ parts: [{ text: finalPrompt }] }]
    }),
    muteHttpExceptions: true
  });

  var body = JSON.parse(response.getContentText());
  var text = body.candidates && body.candidates[0] && body.candidates[0].content.parts[0].text;
  return AIProviderClient_parseJsonText_(text || "");
}

function AIProviderClient_extractOpenAIText_(response) {
  var body = JSON.parse(response.getContentText());
  return body.choices && body.choices[0] && body.choices[0].message
    ? body.choices[0].message.content
    : "";
}

function AIProviderClient_parseJsonText_(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw AppError_create("AI_RESPONSE_INVALID", "AI provider did not return valid JSON.");
  }
}

