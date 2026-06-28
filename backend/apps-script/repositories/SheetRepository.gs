function SheetRepository_getRecords(sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw AppError_create("SHEET_NOT_FOUND", sheetName + " sheet was not found.");
  }

  var values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  var headers = values[0];

  return values.slice(1).filter(function(row) {
    return row.some(function(cell) { return cell !== ""; });
  }).map(function(row) {
    return SheetRepository_rowToRecord(headers, row);
  });
}

function SheetRepository_findOneBy(sheetName, field, value) {
  var target = String(value || "");
  return SheetRepository_getRecords(sheetName).find(function(record) {
    return String(record[field] || "") === target;
  }) || null;
}

function SheetRepository_updateById(sheetName, idField, idValue, updates) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    return;
  }

  var values = sheet.getDataRange().getValues();
  var headers = values[0] || [];
  var idIndex = headers.indexOf(idField);

  if (idIndex === -1) {
    return;
  }

  for (var rowIndex = 1; rowIndex < values.length; rowIndex += 1) {
    if (String(values[rowIndex][idIndex]) === String(idValue)) {
      Object.keys(updates).forEach(function(key) {
        var columnIndex = headers.indexOf(key);

        if (columnIndex !== -1) {
          sheet.getRange(rowIndex + 1, columnIndex + 1).setValue(updates[key]);
        }
      });
      return;
    }
  }
}

function SheetRepository_appendRecord(sheetName, record) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    return;
  }

  if (sheet.getLastColumn() < 1) {
    throw AppError_create("SHEET_HEADERS_NOT_FOUND", sheetName + " sheet has no headers.");
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] || [];
  var row = headers.map(function(header) {
    return Object.prototype.hasOwnProperty.call(record, header) ? record[header] : "";
  });

  sheet.appendRow(row);
}

function SheetRepository_rowToRecord(headers, row) {
  return headers.reduce(function(record, header, index) {
    record[header] = row[index];
    return record;
  }, {});
}
