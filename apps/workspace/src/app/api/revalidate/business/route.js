import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

const SERVER_IP = process.env.NEXT_PUBLIC_SERVER_IP;

export async function POST(request) {
  try {
    const { businessId } = await request.json();

    if (!businessId) {
      console.error(' [REVALIDATE] businessId is required');
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    console.log(`🔄 [REVALIDATE] On-demand revalidation triggered for business: ${businessId}`);

    // STEP 1: Revalidate the specific business page
    revalidateTag(`business-${businessId}`);
    
    // STEP 2: Also revalidate the business list if needed
    revalidateTag('businesses-list');

    // STEP 3: Optionally pre-fetch updated data
    try {
      await fetch(`http://${SERVER_IP}:3001/trpc/getBusinessById?input=${businessId}`, {
        next: { revalidate: 0 }
      });
      console.log(` [REVALIDATE] Pre-fetched fresh data for business: ${businessId}`);
    } catch (fetchError) {
      console.warn(` [REVALIDATE] Could not pre-fetch data: ${fetchError}`);
    }

    return NextResponse.json({ 
      success: true,
      revalidated: true, 
      businessId,
      timestamp: new Date().toISOString(),
      message: `Business ${businessId} revalidated successfully`
    });
  } catch (error) {
    console.error(' [REVALIDATE] Revalidation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Revalidation failed',
        details: error.message || 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const businessId = searchParams.get('businessId');
  
  if (!businessId) {
    return NextResponse.json({ error: 'businessId required' }, { status: 400 });
  }

  try {
    console.log(`[REVALIDATE] GET revalidation for business: ${businessId}`);
    revalidateTag(`business-${businessId}`);
    
    return NextResponse.json({ 
      revalidated: true, 
      businessId,
      now: Date.now() 
    });
  } catch (error) {
    console.error('[REVALIDATE] GET revalidation error:', error);
    return NextResponse.json(
      { error: 'Revalidation failed' }, 
      { status: 500 }
    );
  }
}