/** 
 * Google Apps Script: Save POSTed name into the active sheet and send Telegram message.
 * Steps: (1) Paste into Apps Script editor (bound to the Spreadsheet) (2) Replace TELEGRAM_TOKEN and CHAT_ID (or leave empty to skip Telegram)
 * (3) Deploy > New deployment > "Web app" > Execute as: Me > Who has access: Anyone
 */

function doPost(e) {
  try {
    // อ่าน payload (JSON)
    var payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter || {};
    }

    var name = (payload.name || "").toString().trim();
    if (!name) {
      return jsonResponse({ status: "error", message: "Missing name" }, 400);
    }

    var time = new Date();

    // ถ้า script bind กับ sheet -> ใช้ getActiveSpreadsheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    // Add header row if sheet empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Name", "DateTime"]);
    }

    sheet.appendRow([name, time]);

    // === Telegram config ===
    var TELEGRAM_TOKEN = "7855792983:AAFHz0DUNqGr8lGyYXnO4W4kh7RI_1y14ps"; // <-- ប្ដូរនៅទីនេះ
    var CHAT_ID = "1481970507";         // <-- ប្ដូរនៅទីនេះ

    var telegramResult = null;
    if (TELEGRAM_TOKEN && CHAT_ID) {
      try {
        var message = "📌 វត្តមានថ្មី:\n👤 ឈ្មោះ: " + name + "\n⏰ ម៉ោង: " + time.toLocaleString();
        var url = "https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/sendMessage";
        var options = {
          method: "post",
          contentType: "application/json",
          payload: JSON.stringify({ chat_id: CHAT_ID, text: message }),
          muteHttpExceptions: true
        };
        var resp = UrlFetchApp.fetch(url, options);
        telegramResult = resp.getContentText();
      } catch (tgErr) {
        telegramResult = "telegram_error: " + tgErr.toString();
      }
    }

    return jsonResponse({ status: "ok", telegram: telegramResult });
  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() }, 500);
  }
}

// Utility: return JSON response
function jsonResponse(obj, code) {
  code = code || 200;
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
