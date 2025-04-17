
import { NextResponse } from "next/server";
import Scribemodel from "../../../models/scribe"
export async function POST(request) {
  try {

    const scribes = await Scribemodel.find({}, '-password');
    if(scribes)
    return NextResponse.json(scribes);
     else
     return  NextResponse.json("not availabe")

   
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}