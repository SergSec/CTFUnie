const mongoose = require('mongoose');
const Consultation = require('../models/Consultation');
const Case = require('../models/Case');

const verifyPersistence = async () => {
    try {
        const conflictId = new mongoose.Types.ObjectId();
        const problemId = 'problem-123';

        console.log('Testing Consultation model...');
        const consultation = new Consultation({
            nombre: 'Test User',
            email: 'test@example.com',
            servicio: 'legal',
            consulta: 'Test consultation',
            conflictId: conflictId,
            problemId: problemId
        });

        await consultation.validate();
        console.log('Consultation validation successful');
        if (consultation.conflictId.toString() === conflictId.toString() && consultation.problemId === problemId) {
            console.log('Consultation fields persisted correctly in model');
        } else {
            throw new Error('Consultation fields not persisted correctly');
        }

        console.log('Testing Case model...');
        const newCase = new Case({
            clientId: new mongoose.Types.ObjectId(),
            title: 'Test Case',
            description: 'Test description',
            category: 'legal',
            conflictId: conflictId,
            problemId: problemId
        });

        await newCase.validate();
        console.log('Case validation successful');
        if (newCase.conflictId.toString() === conflictId.toString() && newCase.problemId === problemId) {
            console.log('Case fields persisted correctly in model');
        } else {
            throw new Error('Case fields not persisted correctly');
        }

        console.log('Testing Conflict model...');
        const Conflict = require('../models/Conflict');
        const conflict = new Conflict({
            title: 'Test Conflict',
            description: 'Test Description',
            service: new mongoose.Types.ObjectId(),
            problems: [
                { id: 'prob-1', label: 'Problem 1', order: 1 },
                { id: 'prob-2', label: 'Problem 2', order: 2 }
            ]
        });

        await conflict.validate();
        console.log('Conflict validation successful');
        if (conflict.problems.length === 2 && conflict.problems[0].id === 'prob-1') {
            console.log('Conflict problems persisted correctly in model');
        } else {
            throw new Error('Conflict problems not persisted correctly');
        }

        console.log('Verification passed!');
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verifyPersistence();
