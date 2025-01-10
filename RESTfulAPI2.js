const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const joi = require('joi');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logging

// Rate limiting
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// In-memory data store (in production, use a proper database)
let items = [];

// Validation schemas
const itemSchema = joi.object({
    name: joi.string().required().min(3).max(50),
    description: joi.string().optional().max(500),
    price: joi.number().optional().min(0),
    category: joi.string().optional()
});

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
};

// Validation middleware
const validateItem = (req, res, next) => {
    const { error } = itemSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            error: 'Validation error',
            details: error.details[0].message
        });
    }
    next();
};

// Routes
// Create: Add a new item
app.post('/api/v1/items', validateItem, async (req, res) => {
    try {
        const newItem = {
            id: Date.now(),
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        items.push(newItem);
        res.status(201).json({
            success: true,
            data: newItem
        });
    } catch (error) {
        next(error);
    }
});

// Read: Get all items with filtering, sorting, and pagination
app.get('/api/v1/items', async (req, res) => {
    try {
        const { category, sort, page = 1, limit = 10 } = req.query;
        let filteredItems = [...items];

        // Filtering
        if (category) {
            filteredItems = filteredItems.filter(item => item.category === category);
        }

        // Sorting
        if (sort) {
            const [field, order] = sort.split(':');
            filteredItems.sort((a, b) => {
                return order === 'desc' 
                    ? b[field].localeCompare(a[field])
                    : a[field].localeCompare(b[field]);
            });
        }

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedItems = filteredItems.slice(startIndex, endIndex);

        res.json({
            success: true,
            count: filteredItems.length,
            data: paginatedItems,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(filteredItems.length / limit)
            }
        });
    } catch (error) {
        next(error);
    }
});

// Read: Get a single item by ID
app.get('/api/v1/items/:id', async (req, res) => {
    try {
        const item = items.find(i => i.id === parseInt(req.params.id));
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'Item not found'
            });
        }
        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        next(error);
    }
});

// Update: Modify an existing item
app.put('/api/v1/items/:id', validateItem, async (req, res) => {
    try {
        const itemIndex = items.findIndex(i => i.id === parseInt(req.params.id));
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Item not found'
            });
        }

        items[itemIndex] = {
            ...items[itemIndex],
            ...req.body,
            updatedAt: new Date()
        };

        res.json({
            success: true,
            data: items[itemIndex]
        });
    } catch (error) {
        next(error);
    }
});

// Delete: Remove an item
app.delete('/api/v1/items/:id', async (req, res) => {
    try {
        const itemIndex = items.findIndex(i => i.id === parseInt(req.params.id));
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Item not found'
            });
        }

        items.splice(itemIndex, 1);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Apply error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});