require('dotenv').config();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const qrcode = require('qrcode');

const User = require('./models/user');
const Visitor = require('./models/visitor');
const Appointment = require('./models/appointment');
const Pass = require('./models/pass');

const seedUsers = [
    {
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin',
    },
    {
        name: 'Security Staff',
        email: 'security@gmail.com',
        password: 'security123',
        role: 'security',
    },
    {
        name: 'Employee User',
        email: 'employee@gmail.com',
        password: 'employee123',
        role: 'employee',
    },
];

async function upsertUser(userData) {
    const hashedPassword = await bcryptjs.hash(userData.password, 10);

    return User.findOneAndUpdate(
        { email: userData.email },
        {
            $set: {
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                role: userData.role,
            },
        },
        {
            upsert: true,
            new: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        }
    );
}

async function seed() {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not set');
    }

    await mongoose.connect(process.env.MONGO_URI);

    try {
        const [admin, security, employee] = await Promise.all(
            seedUsers.map((user) => upsertUser(user))
        );

        const visitor = await Visitor.findOneAndUpdate(
            { email: 'visitor.demo@gmail.com' },
            {
                $set: {
                    name: 'Demo Visitor',
                    email: 'visitor.demo@gmail.com',
                    phone: '5551234567',
                    company: 'DemoCorp',
                    purpose: 'Product walkthrough',
                    host: employee.name,
                },
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        const appointment = await Appointment.findOneAndUpdate(
            {
                visitor: visitor._id,
                host: employee._id,
                purpose: 'Product walkthrough',
            },
            {
                $set: {
                    visitor: visitor._id,
                    host: employee._id,
                    purpose: 'Product walkthrough',
                    visitdate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    status: 'approved',
                },
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        const passnumber = 'PASS-DEMO-001';
        const qrcodeData = JSON.stringify({
            passnumber,
            visitor: {
                _id: visitor._id,
                name: visitor.name,
                email: visitor.email,
                phone: visitor.phone,
            },
        });
        const qrCodeUrl = await qrcode.toDataURL(qrcodeData);

        await Pass.findOneAndUpdate(
            { appointment: appointment._id },
            {
                $set: {
                    appointment: appointment._id,
                    visitor: visitor._id,
                    qrcode: qrCodeUrl,
                    passnumber,
                    validtill: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    status: 'active',
                },
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        console.log('Demo data seeded successfully');
        console.log('Admin:', admin.email, '/ admin123');
        console.log('Security:', security.email, '/ security123');
        console.log('Employee:', employee.email, '/ employee123');
        console.log('Visitor pass:', passnumber);
    } finally {
        await mongoose.disconnect();
    }
}

seed().catch(async (error) => {
    console.error('Seed failed:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});