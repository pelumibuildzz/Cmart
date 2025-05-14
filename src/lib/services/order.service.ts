import { prisma } from '../server/prisma';

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      business: true,
      orderItems: {
        include: {
          product: true
        }
      },
      discount: true
    }
  });
}

export async function getOrders(
  params: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
    include?: any;
  } = {}
) {
  const { skip, take, where, orderBy, include } = params;
  return prisma.order.findMany({
    skip,
    take,
    where,
    orderBy,
    include: {
      user: true,
      business: true,
      orderItems: {
        include: {
          product: true
        }
      },
      discount: true,
      ...include
    }
  });
}

export async function getOrdersByUserId(userId: string) {
  return prisma.order.findMany({
    where: {
      userId,
    },
    include: {
      user: true,
      business: true,
      orderItems: {
        include: {
          product: true
        }
      },
      discount: true
    }
  });
}

export async function getOrdersByBusinessId(businessId: string) {
  return prisma.order.findMany({
    where: {
      businessId,
    },
    include: {
      user: true,
      business: true,
      orderItems: {
        include: {
          product: true
        }
      },
      discount: true
    }
  });
}

export async function createOrder(data: any) {
  return prisma.order.create({
    data,
    include: {
      user: true,
      business: true,
      orderItems: {
        include: {
          product: true
        }
      },
      discount: true
    }
  });
}

export async function createOrderGroup(data: any) {
  return prisma.orderGroup.create({
    data,
    include: {
      user: true,
      orders: {
        include: {
          business: true,
          orderItems: {
            include: {
              product: true
            }
          },
          discount: true
        }
      },
      ratings: true
    }
  });
}

export async function getOrderGroupById(id: string) {
  return prisma.orderGroup.findUnique({
    where: { id },
    include: {
      user: true,
      shippingUniversity: true,
      orders: {
        include: {
          business: true,
          orderItems: {
            include: {
              product: true
            }
          },
          discount: true
        }
      },
      ratings: true
    }
  });
}

export async function getOrderGroupsByUserId(userId: string) {
  return prisma.orderGroup.findMany({
    where: {
      userId,
    },
    include: {
      shippingUniversity: true,
      orders: {
        include: {
          business: true,
          orderItems: {
            include: {
              product: true
            }
          },
          discount: true
        }
      },
      ratings: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function updateOrderGroup(id: string, data: any) {
  return prisma.orderGroup.update({
    where: { id },
    data,
    include: {
      user: true,
      orders: {
        include: {
          business: true,
          orderItems: {
            include: {
              product: true
            }
          },
          discount: true
        }
      },
      ratings: true
    }
  });
}

export async function updateOrder(id: string, data: any) {
  return prisma.order.update({
    where: { id },
    data,
    include: {
      user: true,
      business: true,
      orderItems: {
        include: {
          product: true
        }
      },
      discount: true
    }
  });
}

export async function deleteOrder(id: string) {
  return prisma.order.delete({
    where: { id },
    include: {
      user: true,
      business: true,
      orderItems: {
        include: {
          product: true
        }
      },
      discount: true
    }
  });
}