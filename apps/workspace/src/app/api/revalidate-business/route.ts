// import { NextRequest, NextResponse } from 'next/server';

// export async function GET(req: NextRequest) {
//   const secret = req.nextUrl.searchParams.get('secret');
//   const id = req.nextUrl.searchParams.get('id');

//   if (secret !== process.env.REVALIDATE_SECRET) {
//     return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
//   }

//   if (!id) {
//     return NextResponse.json({ message: 'Missing id parameter' }, { status: 400 });
//   }

//   try {
//     const path = `/business/${id}`;
//     await res.revalidate(path);
//     return NextResponse.json({ revalidated: true, path });
//   } catch (err) {
//     return NextResponse.json({ message: 'Error', error: err }, { status: 500 });
//   }
// }
