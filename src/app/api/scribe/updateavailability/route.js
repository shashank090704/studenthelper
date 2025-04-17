import { connect } from "../../../../lib/dbconnect";
import { NextResponse } from "next/server";
import scribemodel from "../../../../models/scribe";


connect();

export async function POST(request) {
  try {
    // Parse request body
    const reqbody = await request.json();
    console.log(reqbody);
    const { availableDates , userId } = reqbody
    console.log(availableDates)
    if (!userId || !Array.isArray(availableDates)) {
      return NextResponse.json({ success: false, message: 'Invalid request data' }, { status: 400 });
    }

    const parsedDates = availableDates.map(date => new Date(date));
    const updatedScribe = await scribemodel.findByIdAndUpdate(
      userId,
      { $addToSet: { availableDates: { $each: parsedDates } } },
      { new: true }
    );
    if (!updatedScribe) {
      return NextResponse.json({ success: false, message: 'Scribe not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedScribe }, { status: 200 });
   
    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
