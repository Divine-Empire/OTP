import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: Request) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { success: false, error: "Supabase configuration variables are not set on the server." },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { items, createdBy, warehouseLocation, lineItemNumber, leadTime, remarks, file } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid items list." },
        { status: 400 }
      )
    }

    // Initialize Supabase client with Service Role Key to bypass RLS safely on the server side
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Upload file to Supabase Storage if provided
    let attachmentUrl = ""
    if (file && file.base64 && file.name && file.type) {
      try {
        const base64Data = file.base64.split(",")[1] || file.base64
        const fileBuffer = Buffer.from(base64Data, "base64")
        
        // Construct a unique filename to prevent collisions in the bucket
        const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_")
        const filePath = `indent/${Date.now()}_${cleanName}`

        const { error: uploadError } = await supabase.storage
          .from("pfms-purchase-fms")
          .upload(filePath, fileBuffer, {
            contentType: file.type,
            upsert: true,
          })

        if (uploadError) {
          console.error("Supabase storage upload error:", uploadError)
          return NextResponse.json({ success: false, error: `Attachment upload failed: ${uploadError.message}` }, { status: 500 })
        }

        // Get the public URL of the uploaded image
        const { data: urlData } = supabase.storage
          .from("pfms-purchase-fms")
          .getPublicUrl(filePath)

        attachmentUrl = urlData?.publicUrl || ""
      } catch (uploadErr: any) {
        console.error("Exception during attachment upload:", uploadErr)
        return NextResponse.json({ success: false, error: `Attachment upload exception: ${uploadErr.message}` }, { status: 500 })
      }
    }

    // 2. Generate unique indent numbers via Supabase RPC function
    let indentNos: string[] = []
    try {
      const { data, error: rpcError } = await supabase.rpc("pfms_generate_next_indent_no", {
        batch_size: items.length,
      })

      if (rpcError || !data || !Array.isArray(data)) {
        console.error("RPC pfms_generate_next_indent_no error:", rpcError)
        return NextResponse.json(
          { success: false, error: `Failed to generate indent numbers: ${rpcError?.message || "Invalid database response"}` },
          { status: 500 }
        )
      }
      indentNos = data
    } catch (rpcErr: any) {
      console.error("Exception executing RPC pfms_generate_next_indent_no:", rpcErr)
      return NextResponse.json({ success: false, error: `Indent generation RPC exception: ${rpcErr.message}` }, { status: 500 })
    }

    // 3. Query the turn around time (actionTime in hours) from pfms_tat table
    let actionTime = 24 // Fallback default to 24 hours
    try {
      const { data: tatData, error: tatError } = await supabase
        .from("pfms_tat")
        .select("actionTime")
        .eq("stageName", "indent-approval")
        .single()

      if (tatError) {
        console.warn("TAT query warning (using default of 24 hours):", tatError.message)
      } else if (tatData && typeof tatData.actionTime === "number") {
        actionTime = tatData.actionTime
      }
    } catch (tatErr) {
      console.warn("Exception querying TAT, using default 24 hours:", tatErr)
    }

    // 4. Calculate plannedIndentApproval timestamp
    const now = new Date()
    const plannedDate = new Date(now.getTime() + actionTime * 60 * 60 * 1000)

    // Helper function to format date exactly as YYYY-MM-DD HH:mm:ss.SSS for PostgreSQL
    const formatTimestamp = (date: Date): string => {
      const YYYY = date.getFullYear()
      const MM = String(date.getMonth() + 1).padStart(2, "0")
      const DD = String(date.getDate()).padStart(2, "0")
      const HH = String(date.getHours()).padStart(2, "0")
      const mm = String(date.getMinutes()).padStart(2, "0")
      const ss = String(date.getSeconds()).padStart(2, "0")
      const SSS = String(date.getMilliseconds()).padStart(3, "0")
      return `${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}.${SSS}`
    }

    const formattedPlannedApproval = formatTimestamp(plannedDate)
    const formattedCreatedAt = formatTimestamp(now)
    const formattedUpdatedAt = formatTimestamp(now)

    // 5. Bulk insert rows into the pfms_indent-generation table
    const rowsToInsert = items.map((item: { name: string; qty: number }, idx: number) => ({
      indentNo: indentNos[idx] || "",
      createdBy: createdBy || "",
      category: "", // Leave blank as before
      itemName: item.name,
      quantity: Number(item.qty) || 0,
      warehouseLocation: warehouseLocation || "",
      itemCode: "", // Leave blank as before
      leadTime: leadTime ? Number(leadTime) : null,
      uom: "", // Blank as specified
      attachment: attachmentUrl,
      status: "pending",
      remarks: remarks || "",
      plannedIndentApproval: formattedPlannedApproval,
      createdAt: formattedCreatedAt,
      updatedAt: formattedUpdatedAt,
    }))

    const { error: insertError } = await supabase
      .from("pfms_indent-generation")
      .insert(rowsToInsert)

    if (insertError) {
      console.error("Error inserting into pfms_indent-generation:", insertError)
      return NextResponse.json(
        { success: false, error: `Database insert failed: ${insertError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Indent generation records created successfully.",
      generatedIds: indentNos,
    })

  } catch (error: any) {
    console.error("Unhandled exception in generate-indent route:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
