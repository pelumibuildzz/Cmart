import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/server/prisma"
import ProductDetails from "@/app/components/product-details"
import { getSession } from "@/lib/auth/session"

interface ProductPageProps {
  params: {
    productId: string
  }
}

export default async function ProductPage({ params: { productId } }: ProductPageProps) {
  // Get current user
  const session = await getSession();
  const userId = session?.user?.id;
  
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
  
  // Check if product is unavailable and the current user is not the owner
  if (!product.isAvailable && (!userId || product.business.userId !== userId)) {
    // Redirect to homepage if trying to access unavailable product
    redirect('/');
  }
  
  // Pass isOwner prop to ProductDetails
  const isOwner = Boolean(userId && product.business.userId === userId);

  return <ProductDetails product={product} isOwner={isOwner} />;
}

