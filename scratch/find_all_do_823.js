const SHEET_ID = "1zo8ZQRrPYUBfNh50i3cosacna075YRTxZNyMWSFuJKc";
const SHEET_NAME = "ORDER-DISPATCH";
const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

async function run() {
  try {
    console.log("Fetching sheet to find all occurrences of DO-823...");
    const response = await fetch(sheetUrl);
    const text = await response.text();

    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}") + 1;
    const jsonData = text.substring(jsonStart, jsonEnd);

    const data = JSON.parse(jsonData);
    const rows = data.table.rows;

    let count = 0;
    rows.forEach((row, index) => {
      if (row && row.c) {
        const orderNo = row.c[1] ? String(row.c[1].v).trim() : "";
        if (orderNo.includes("DO-823")) {
          count++;
          console.log(`\nOccurrence #${count} found at index ${index} (Row in JSON: ${index + 1}):`);
          row.c.forEach((cell, idx) => {
            if (cell && cell.v !== null && cell.v !== "") {
              console.log(`  Index ${idx}: ${cell.v}`);
            }
          });
        }
      }
    });

    console.log(`\nFound total of ${count} occurrences.`);
  } catch (err) {
    console.error(err);
  }
}
run();
