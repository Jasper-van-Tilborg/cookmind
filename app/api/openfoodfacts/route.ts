import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const barcode = searchParams.get('barcode');

  if (!barcode) {
    return NextResponse.json(
      { error: 'Barcode is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const data = await response.json();

    if (data.status === 0 || !data.product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = data.product;

    // Extract relevant product information
    const productData = {
      barcode: product.code || barcode,
      name: product.product_name || product.product_name_en || product.product_name_nl || 'Onbekend product',
      image: product.image_url || product.image_front_url || product.image_front_small_url || null,
      brand: product.brands || product.brand || null,
      quantity: product.quantity || null,
      categories: product.categories || null,
      nutriments: product.nutriments || null,
    };

    return NextResponse.json(productData);
  } catch (error) {
    console.error('Error fetching product from Open Food Facts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product information' },
      { status: 500 }
    );
  }
}
