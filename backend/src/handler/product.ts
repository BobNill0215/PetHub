import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { success, fail } from '../pkg/response';

const createProductSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.enum(['PET_FOOD', 'SUPPLIES', 'PET_LIVE', 'SECONDHAND']),
  price: z.number().int().positive(),
  originalPrice: z.number().int().optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string()).max(9).optional(),
  description: z.string().optional(),
  condition: z.string().optional(),
  city: z.string().optional(),
});

export async function handleCreateProduct(req: Request, res: Response) {
  try {
    const body = createProductSchema.parse(req.body);
    const product = await prisma.product.create({
      data: {
        ...body,
        sellerId: req.user!.userId,
        images: body.images || [],
        status: 'LISTED',
      },
    });
    return success(res, product, 201);
  } catch (err) {
    if (err instanceof z.ZodError) return fail(res, err.errors[0].message);
    if (err instanceof Error) return fail(res, err.message);
    return fail(res, '发布商品失败');
  }
}

export async function handleGetProducts(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const pageSize = Math.min(20, Math.max(1, parseInt(String(req.query.pageSize)) || 10));
    const category = req.query.category as string | undefined;
    const city = req.query.city as string | undefined;

    const where: any = { status: 'LISTED' };
    if (category) where.category = category;
    if (city) where.city = city;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { seller: { select: { id: true, nickname: true, avatar: true, city: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    return success(res, { data: products, total, page, page_size: pageSize });
  } catch {
    return fail(res, '获取商品列表失败');
  }
}

export async function handleGetProductById(req: Request, res: Response) {
  try {
    const id = parseInt(String(req.params.id));
    const product = await prisma.product.findUnique({
      where: { id },
      include: { seller: { select: { id: true, nickname: true, avatar: true, city: true } } },
    });
    if (!product) return fail(res, '商品不存在', 40401, 404);
    return success(res, product);
  } catch {
    return fail(res, '获取商品失败');
  }
}

export async function handleGetMyProducts(req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany({
      where: { sellerId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });
    return success(res, products);
  } catch {
    return fail(res, '获取我的商品失败');
  }
}
