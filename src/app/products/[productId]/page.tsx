import { notFound } from "next/navigation"
import { prisma } from "@/lib/server/prisma"
import ProductDetails from "@/app/components/product-details"

interface ProductPageProps {
  params: {
    productId: string
  }
}

export default async function ProductPage({ params: { productId } }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: true,
      business: true,
      categories: true,
      subCategories: true
    }
  });

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}

