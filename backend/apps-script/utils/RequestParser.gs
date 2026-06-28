function RequestParser_parsePost(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw AppError_create("PARSE_ERROR", "POST body is required.");
  }

  return JSON.parse(e.postData.contents);
}

