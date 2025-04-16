import { prisma } from '../server/prisma';

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
  });
}

export async function getOrders(
  params: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
  } = {}
) {
  const { skip, take, where, orderBy } = params;
  return prisma.order.findMany({
    skip,
    take,
    where,
    orderBy,
  });
}

export async function getOrdersByUserId(userId: string) {
  return prisma.order.findMany({
    where: {
      userId,
    },
  });
}

export async function getOrdersByBusinessId(businessId: string) {
  return prisma.order.findMany({
    where: {
      businessId,
    },
  });
}

export async function createOrder(data: any) {
  return prisma.order.create({
    data,
  });
}

export async function updateOrder(id: string, data: any) {
  return prisma.order.update({
    where: { id },
    data,
  });
}

export async function deleteOrder(id: string) {
  return prisma.order.delete({
    where: { id },
  });
} 