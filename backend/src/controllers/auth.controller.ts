import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../server';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'BUYER',
        name: name || 'User',
      },
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({ user: { id: user.id, email: user.email, role: user.role, name: user.name }, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);

    res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name }, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
