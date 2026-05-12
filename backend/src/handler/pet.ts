import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { success, fail } from '../pkg/response';

const createPetSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['DOG', 'CAT', 'OTHER']),
  breed: z.string().max(50).optional(),
  gender: z.number().int().min(0).max(2).optional(),
  birthDate: z.string().optional(),
  weight: z.number().positive().optional(),
  isNeutered: z.boolean().optional(),
  vaccineStatus: z.enum(['none', 'partial', 'completed']).optional(),
  avatar: z.string().optional(),
  color: z.string().max(50).optional(),
  personalityTags: z.array(z.string()).optional(),
  bio: z.string().max(500).optional(),
});

export async function handleCreatePet(req: Request, res: Response) {
  try {
    const body = createPetSchema.parse(req.body);
    const pet = await prisma.pet.create({
      data: {
        ...body,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
        userId: req.user!.userId,
      },
    });
    return success(res, pet, 201);
  } catch (err) {
    if (err instanceof z.ZodError) return fail(res, err.errors[0].message);
    if (err instanceof Error) return fail(res, err.message);
    return fail(res, '添加宠物失败');
  }
}

export async function handleGetUserPets(req: Request, res: Response) {
  try {
    const pets = await prisma.pet.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });
    return success(res, pets);
  } catch {
    return fail(res, '获取宠物列表失败');
  }
}

export async function handleUpdatePet(req: Request, res: Response) {
  try {
    const petId = parseInt(String(req.params.id));
    const body = createPetSchema.partial().parse(req.body);

    const pet = await prisma.pet.findFirst({
      where: { id: petId, userId: req.user!.userId },
    });
    if (!pet) return fail(res, '宠物不存在', 40401, 404);

    const updated = await prisma.pet.update({
      where: { id: petId },
      data: {
        ...body,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
      },
    });
    return success(res, updated);
  } catch (err) {
    if (err instanceof z.ZodError) return fail(res, err.errors[0].message);
    if (err instanceof Error) return fail(res, err.message);
    return fail(res, '更新宠物失败');
  }
}

export async function handleDeletePet(req: Request, res: Response) {
  try {
    const petId = parseInt(String(req.params.id));
    const pet = await prisma.pet.findFirst({
      where: { id: petId, userId: req.user!.userId },
    });
    if (!pet) return fail(res, '宠物不存在', 40401, 404);

    await prisma.pet.delete({ where: { id: petId } });
    return success(res, null);
  } catch {
    return fail(res, '删除宠物失败');
  }
}
