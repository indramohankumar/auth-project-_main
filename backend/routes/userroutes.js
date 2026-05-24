const express = require('express');
const User = require('../models/user');
const authmiddleware = require('../middleware/authmiddleware');
const rolemiddleware = require('../middleware/rolemiddleware');

const router = express.Router();

// Public route to get hosts for visitor pre-registration
router.get('/public/hosts', async (req, res) => {
    try {
        const hosts = await User.find().select('name _id role');
        res.status(200).json({ hosts });
    } catch (err) {
        res.status(500).json({ message: 'error fetching hosts', error: err.message });
    }
});

const stripPassword = (user) => {
    if (!user) {
        return user;
    }

    const safeUser = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete safeUser.password;
    return safeUser;
};

router.get('/', authmiddleware, rolemiddleware('admin'), async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });

        res.status(200).json({
            users: users.map(stripPassword),
        });
    } catch (err) {
        res.status(500).json({
            message: 'error loading users',
            error: err.message,
        });
    }
});

router.put('/:id/role', authmiddleware, rolemiddleware('admin'), async (req, res) => {
    try {
        const { role } = req.body;
        const targetUserId = req.params.id;

        if (!['admin', 'employee', 'security'].includes(role)) {
            return res.status(400).json({
                message: 'invalid role',
            });
        }

        if (targetUserId === req.user.id && role !== 'admin') {
            return res.status(400).json({
                message: 'you cannot remove your own admin access',
            });
        }

        if (role !== 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            const targetUser = await User.findById(targetUserId).select('role');

            if (!targetUser) {
                return res.status(404).json({
                    message: 'user not found',
                });
            }

            if (targetUser.role === 'admin' && adminCount <= 1) {
                return res.status(400).json({
                    message: 'you must keep at least one admin account',
                });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            targetUserId,
            { role },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: 'user not found',
            });
        }

        res.status(200).json({
            message: 'user role updated',
            user: stripPassword(updatedUser),
        });
    } catch (err) {
        res.status(500).json({
            message: 'error updating role',
            error: err.message,
        });
    }
});

module.exports = router;