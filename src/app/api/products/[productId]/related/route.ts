import { NextRequest, NextResponse } from 'next/server';
import { getRelatedProducts } from '@/lib/services/product.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const relatedProducts = await getRelatedProducts(productId);
    
    return NextResponse.json(relatedProducts);
  } catch (error) {
    console.error('Error fetching related products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related products' },
      { status: 500 }
    );
  }
}
