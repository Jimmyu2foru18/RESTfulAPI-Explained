# Advanced RESTful API Documentation

This is an enhanced version of the RESTful API implementation using Node.js and Express, featuring advanced integration patterns and best practices.

## Features
- Input validation using Joi
- Rate limiting
- CORS support
- Security headers with Helmet
- Error handling middleware
- Request logging
- Filtering, sorting, and pagination
- Health check endpoint

## Setup Instructions

1. Initialize the project:
```bash
npm init -y
```

2. Install dependencies:
```bash
npm install express cors helmet joi morgan express-rate-limit
```

## API Endpoints

### Items Resource

| Method | Endpoint | Description | Query Parameters | Request Body |
|--------|----------|-------------|------------------|--------------|
| GET | `/api/v1/items` | Retrieve all items | `category`, `sort`, `page`, `limit` | N/A |
| GET | `/api/v1/items/:id` | Retrieve a specific item | N/A | N/A |
| POST | `/api/v1/items` | Create a new item | N/A | Item object |
| PUT | `/api/v1/items/:id` | Update an item | N/A | Item object |
| DELETE | `/api/v1/items/:id` | Delete an item | N/A | N/A |
| GET | `/health` | Health check | N/A | N/A |

### Query Parameters
- `category`: Filter items by category
- `sort`: Sort items by field (format: `field:asc` or `field:desc`)
- `page`: Page number for pagination (default: 1)
- `limit`: Items per page (default: 10)

### Item Object Schema
```json
{
    "name": "string (required, 3-50 chars)",
    "description": "string (optional, max 500 chars)",
    "price": "number (optional, min 0)",
    "category": "string (optional)"
}
```

## Response Format

### Success Response
```json
{
    "success": true,
    "data": "<requested data>",
    "pagination": {
        "currentPage": 1,
        "totalPages": 5
    }
}
```

### Error Response
```json
{
    "success": false,
    "error": "Error message"
}
```

## Response Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success - Request completed successfully |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request successful, no content returned |
| 400 | Bad Request - Invalid request format or validation error |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Server Error - Internal server error |

## Security Features

1. **Rate Limiting**: 100 requests per hour per IP
2. **CORS**: Cross-Origin Resource Sharing enabled
3. **Helmet**: Security headers automatically applied
4. **Input Validation**: All inputs are validated using Joi

## Running the Server

Start the server:
```bash
node RestfulAPI2.js
```

The API will be available at `http://localhost:3000`

## Example Requests

### Create an Item
```bash
curl -X POST http://localhost:3000/api/v1/items \
-H "Content-Type: application/json" \
-d '{
    "name": "New Item",
    "description": "Item description",
    "price": 29.99,
    "category": "electronics"
}'
```

### Get Items with Filtering and Sorting
```bash
curl "http://localhost:3000/api/v1/items?category=electronics&sort=name:asc&page=1&limit=10"
```

### Health Check
```bash
curl http://localhost:3000/health
```