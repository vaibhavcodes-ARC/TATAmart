"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const server_1 = require("../server");
const jwt_1 = require("../utils/jwt");
const register = async (req, res) => {
    try {
        const { email, password, role, name } = req.body;
        console.log('[AUTH REGISTER] Attempting registration for:', email, 'Role:', role);
        if (!email || !password) {
            console.warn('[AUTH REGISTER] Missing email or password');
            return res.status(400).json({ message: 'Email and password are required' });
        }
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.warn('[AUTH REGISTER] Invalid email format:', email);
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (password.length < 6) {
            console.warn('[AUTH REGISTER] Password too short');
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        let existingUser;
        try {
            existingUser = await server_1.prisma.user.findUnique({ where: { email } });
        }
        catch (dbErr) {
            console.error('[AUTH REGISTER] Database connection failed:', dbErr);
            return res.status(500).json({ message: 'Database connection failed. Please try again later.' });
        }
        if (existingUser) {
            console.warn('[AUTH REGISTER] Email already exists:', email);
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        let hashedPassword;
        try {
            hashedPassword = await bcryptjs_1.default.hash(password, 10);
        }
        catch (hashErr) {
            console.error('[AUTH REGISTER] Password hashing failed:', hashErr);
            return res.status(500).json({ message: 'Password security hashing failed' });
        }
        let user;
        try {
            user = await server_1.prisma.user.create({
                data: {
                    email: email.toLowerCase().trim(),
                    password: hashedPassword,
                    role: role || 'BUYER',
                    name: name || 'User',
                },
            });
            console.log('[AUTH REGISTER] User successfully created in DB:', user.id);
        }
        catch (createErr) {
            console.error('[AUTH REGISTER] User creation failed in DB:', createErr);
            return res.status(500).json({ message: 'Failed to persist user to database', error: createErr });
        }
        let token;
        try {
            token = (0, jwt_1.generateToken)(user.id, user.role);
        }
        catch (jwtErr) {
            console.error('[AUTH REGISTER] JWT generation failed:', jwtErr);
            return res.status(500).json({ message: 'JWT signing secret missing or misconfigured' });
        }
        res.status(201).json({
            user: { id: user.id, email: user.email, role: user.role, name: user.name },
            token
        });
    }
    catch (error) {
        console.error('[AUTH REGISTER] Silent crash caught:', error);
        res.status(500).json({ message: 'Internal server error during registration', error });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('[AUTH LOGIN] Attempting login for:', email);
        if (!email || !password) {
            console.warn('[AUTH LOGIN] Missing email or password field');
            return res.status(400).json({ message: 'Email and password are required' });
        }
        let user;
        try {
            user = await server_1.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        }
        catch (dbErr) {
            console.error('[AUTH LOGIN] Database lookup failure:', dbErr);
            return res.status(500).json({ message: 'Database connection failed during lookup' });
        }
        if (!user) {
            console.warn('[AUTH LOGIN] No user found with email:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        let isMatch = false;
        try {
            isMatch = await bcryptjs_1.default.compare(password, user.password);
        }
        catch (compErr) {
            console.error('[AUTH LOGIN] Password comparison failed:', compErr);
            return res.status(500).json({ message: 'Security password comparison failed' });
        }
        if (!isMatch) {
            console.warn('[AUTH LOGIN] Password mismatch for user:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        let token;
        try {
            token = (0, jwt_1.generateToken)(user.id, user.role);
        }
        catch (jwtErr) {
            console.error('[AUTH LOGIN] JWT signing failed:', jwtErr);
            return res.status(500).json({ message: 'JWT secret token generation failed' });
        }
        console.log('[AUTH LOGIN] Login successful for user:', user.id);
        res.json({
            user: { id: user.id, email: user.email, role: user.role, name: user.name },
            token
        });
    }
    catch (error) {
        console.error('[AUTH LOGIN] Silent crash caught:', error);
        res.status(500).json({ message: 'Internal server error during login', error });
    }
};
exports.login = login;
