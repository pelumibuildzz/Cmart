import { prisma } from '../server/prisma';

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      User: true,
      Business: true,
      OrderItems: {
        include: {
          Product: true
        }
      }
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
      User: true,
      Business: true,
      OrderItems: {
        include: {
          Product: true
        }
      },
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
      User: true,
      Business: true,
      OrderItems: {
        include: {
          Product: true
        }
      }
    }
  });
}

export async function getOrdersByBusinessId(businessId: string) {
  return prisma.order.findMany({
    where: {
      businessId,
    },
    include: {
      User: true,
      Business: true,
      OrderItems: {
        include: {
          Product: true
        }
      }
    }
  });
}

export async function createOrder(data: any) {
  return prisma.order.create({
    data,
    include: {
      User: true,
      Business: true,
      OrderItems: {
        include: {
          Product: true
        }
      }
    }
  });
}

export async function createOrderGroup(data: any) {
  return prisma.orderGroup.create({
    data,
    include: {
      User: true,
      orders: {
        include: {
          Business: true,
          OrderItems: {
            include: {
              Product: true
            }
          }
        }
      }
    }
  });
}

export async function getOrderGroupById(id: string) {
  return prisma.orderGroup.findUnique({
    where: { id },
    include: {
      User: true,
      orders: {
        include: {
          Business: true,
          OrderItems: {
            include: {
              Product: true
            }
          }
        }
      }
    }
  });
}

export async function getOrderGroupsByUserId(userId: string) {
  return prisma.orderGroup.findMany({
    where: {
      userId,
    },
    include: {
      orders: {
        include: {
          Business: true,
          OrderItems: {
            include: {
              Product: true
            }
          }
        }
      }
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
      User: true,
      orders: {
        include: {
          Business: true,
          OrderItems: {
            include: {
              Product: true
            }
          }
        }
      }
    }
  });
}

export async function updateOrder(id: string, data: any) {
  return prisma.order.update({
    where: { id },
    data,
    include: {
      User: true,
      Business: true,
      OrderItems: {
        include: {
          Product: true
        }
      }
    }
  });
}

export async function deleteOrder(id: string) {
  return prisma.order.delete({
    where: { id },
    include: {
      User: true,
      Business: true,
      OrderItems: {
        include: {
          Product: true
        }
      }
    }
  });
}