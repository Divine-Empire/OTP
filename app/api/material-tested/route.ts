import { NextResponse } from "next/server"

const INDENT_SCRIPT_URL = process.env.INDENT_SCRIPT_URL

export async function GET() {
  try {
    if (!INDENT_SCRIPT_URL) {
      return NextResponse.json({ success: false, error: "INDENT_SCRIPT_URL environment variable is not defined" })
    }

    // 1. Fetch Serial-Generation
    const serialUrl = `${INDENT_SCRIPT_URL}?sheet=Serial-Generation`
    const serialRes = await fetch(serialUrl, { method: "GET", redirect: "follow" })
    if (!serialRes.ok) {
      return NextResponse.json({ success: false, error: `Serial-Generation fetch failed: status ${serialRes.status}` })
    }
    const serialRaw = await serialRes.json()
    if (!serialRaw.success || !Array.isArray(serialRaw.data)) {
      return NextResponse.json({ success: false, error: serialRaw.error || "Failed to fetch Serial-Generation data" })
    }

    // 2. Fetch Material-Testing
    const testingUrl = `${INDENT_SCRIPT_URL}?sheet=Material-Testing`
    const testingRes = await fetch(testingUrl, { method: "GET", redirect: "follow" })
    if (!testingRes.ok) {
      return NextResponse.json({ success: false, error: `Material-Testing fetch failed: status ${testingRes.status}` })
    }
    const testingRaw = await testingRes.json()
    if (!testingRaw.success || !Array.isArray(testingRaw.data)) {
      return NextResponse.json({ success: false, error: testingRaw.error || "Failed to fetch Material-Testing data" })
    }

    // 3. Process Serial-Generation: skip 6 headers, filter out empty rows
    const rawSerials = serialRaw.data.slice(6)
    const serials = rawSerials
      .filter((row: any[]) => {
        // filter out rows that are entirely empty or don't have a Lift No (index 1)
        if (!row || row.length < 2) return false
        const hasData = row.some(cell => cell !== "" && cell !== null && cell !== undefined)
        const hasLiftNo = String(row[1] || "").trim() !== ""
        return hasData && hasLiftNo
      })
      .map((row: any[]) => ({
        liftNo: String(row[1] || "").trim(),
        qrCode: String(row[2] || "").trim(),
        serialNo: String(row[3] || "").trim(),
        vendorName: String(row[4] || "").trim(),
        itemName: String(row[5] || "").trim(),
        invoiceDate: String(row[6] || "").trim(),
      }))

    // 4. Process Material-Testing: skip 6 headers, filter out empty rows
    const rawTesting = testingRaw.data.slice(6)
    const testings = rawTesting
      .filter((row: any[]) => {
        if (!row || row.length < 5) return false
        const hasData = row.some(cell => cell !== "" && cell !== null && cell !== undefined)
        const hasLiftNo = String(row[2] || "").trim() !== ""
        return hasData && hasLiftNo
      })
      .map((row: any[]) => ({
        timestamp: String(row[0] || "").trim(),
        indentNo: String(row[1] || "").trim(),
        liftNo: String(row[2] || "").trim(),
        qcDate: String(row[3] || "").trim(),
        workingCondition: String(row[4] || "").trim(),
        checkedBy: String(row[5] || "").trim(),
        serialNo: String(row[8] || "").trim(),
      }))

    // 5. Create a map of Serial No -> { machineName, qrCode } from Serial-Generation
    const serialMap = new Map<string, { machineName: string; qrCode: string }>()
    serials.forEach(s => {
      if (s.serialNo) {
        serialMap.set(s.serialNo, {
          machineName: s.itemName,
          qrCode: s.qrCode
        })
      }
    })

    // 6. Filter tests and map to individual serial rows
    const flatRows: any[] = []
    testings.forEach(test => {
      const cond = test.workingCondition.toLowerCase().replace(/[\s_]+/g, "")
      const isPassed = cond === "passed" || cond === "passedbutconcern" || cond === "passedbutconcerned"

      if (isPassed) {
        // Split comma-separated serial numbers
        const serialsList = test.serialNo.split(",").map(s => s.trim()).filter(Boolean)
        
        if (serialsList.length === 0) {
          flatRows.push({
            indentNo: test.indentNo,
            liftNo: test.liftNo,
            machineName: "",
            serialNo: "",
            qrCode: ""
          })
        } else {
          serialsList.forEach(sn => {
            const serialInfo = serialMap.get(sn)
            flatRows.push({
              indentNo: test.indentNo,
              liftNo: test.liftNo,
              machineName: serialInfo ? serialInfo.machineName : "",
              serialNo: sn,
              qrCode: serialInfo ? serialInfo.qrCode : ""
            })
          })
        }
      }
    })

    return NextResponse.json({ success: true, data: flatRows })

  } catch (error: any) {
    console.error("Error in material-tested route:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" })
  }
}
