-- ═══════════════════════════════════════════════════════════════════
-- CODEX SEED DATA
-- Professional API documentation for developers
-- ═══════════════════════════════════════════════════════════════════

-- Clear existing data (optional - comment out if you want to preserve data)
DELETE FROM links;
DELETE FROM notes;

-- ─────────────────────────────────────────────────────────────────────
-- GETTING STARTED SECTION
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO notes (title, content, tags, section, "order") VALUES
(
  'Introduction',
  '# Introduction

Welcome to the Codex API documentation. This guide will help you integrate our powerful REST API into your applications.

## What is Codex API?

Codex API provides a comprehensive set of endpoints for managing users, posts, and comments. Whether you''re building a social platform, content management system, or any application requiring user-generated content, our API has you covered.

## Key Features

- **RESTful Design**: Clean, predictable URLs following REST conventions
- **JSON Responses**: All responses are returned in JSON format
- **Authentication Options**: Support for [[OAuth 2.0]] and [[API Keys]]
- **Rate Limiting**: Fair usage policies with generous limits (see [[Rate Limiting]])
- **Comprehensive Error Handling**: Detailed error responses (see [[Error Handling]])

## Base URL

All API requests should be made to:

```
https://api.codex.dev/v1
```

## Getting Help

- Check the [[Quick Start]] guide for your first API call
- Review [[Authentication Overview]] for security setup
- Browse the [[Users API]], [[Posts API]], and [[Comments API]] reference

## Next Steps

Ready to get started? Head to [[Installation]] to set up your development environment.',
  ARRAY['getting-started', 'overview'],
  'Getting Started',
  1
),
(
  'Installation',
  '# Installation

Get up and running with the Codex API in minutes. Choose your preferred language and follow the installation instructions below.

## Prerequisites

- An active Codex account
- API credentials (see [[API Keys]] or [[OAuth 2.0]])
- Your preferred programming language runtime

## SDK Installation

### JavaScript / Node.js

```bash
npm install @codex/api-client
# or
yarn add @codex/api-client
```

### Python

```bash
pip install codex-api
```

### Ruby

```bash
gem install codex-api
```

### Go

```bash
go get github.com/codex/api-go
```

## Configuration

After installation, configure the client with your API key:

### JavaScript

```javascript
import { CodexClient } from ''@codex/api-client'';

const client = new CodexClient({
  apiKey: process.env.CODEX_API_KEY,
  baseUrl: ''https://api.codex.dev/v1''
});
```

### Python

```python
from codex import CodexClient

client = CodexClient(
    api_key=os.environ[''CODEX_API_KEY''],
    base_url=''https://api.codex.dev/v1''
)
```

## Verifying Installation

Test your setup by fetching the current user:

```javascript
const user = await client.users.me();
console.log(''Connected as:'', user.name);
```

## Next Steps

Now that you''re set up, try the [[Quick Start]] guide to make your first API call, or review [[Authentication Overview]] for security best practices.',
  ARRAY['getting-started', 'setup'],
  'Getting Started',
  2
),
(
  'Quick Start',
  '# Quick Start

Make your first API call in under 5 minutes. This guide assumes you''ve completed the [[Installation]] steps.

## Your First Request

Let''s fetch a list of users from the API:

### Using cURL

```bash
curl -X GET "https://api.codex.dev/v1/users" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### Using JavaScript

```javascript
import { CodexClient } from ''@codex/api-client'';

const client = new CodexClient({ apiKey: ''YOUR_API_KEY'' });

// Fetch users
const users = await client.users.list({ limit: 10 });
console.log(users);
```

### Using Python

```python
from codex import CodexClient

client = CodexClient(api_key=''YOUR_API_KEY'')

# Fetch users
users = client.users.list(limit=10)
print(users)
```

## Understanding the Response

A successful response looks like this:

```json
{
  "data": [
    {
      "id": "usr_123abc",
      "name": "Jane Developer",
      "email": "jane@example.com",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "per_page": 10
  }
}
```

## Creating a Resource

Let''s create a new post:

```javascript
const post = await client.posts.create({
  title: ''My First Post'',
  content: ''Hello, Codex API!'',
  published: true
});

console.log(''Created post:'', post.id);
```

## Common Operations

| Operation | Endpoint | Method |
|-----------|----------|--------|
| List users | `/users` | GET |
| Get user | `/users/:id` | GET |
| Create post | `/posts` | POST |
| Update post | `/posts/:id` | PUT |
| Delete comment | `/comments/:id` | DELETE |

## Next Steps

- Learn about [[Authentication Overview]] for production security
- Explore the [[Users API]] for user management
- Handle errors gracefully with [[Error Handling]]
- Implement [[Pagination]] for large datasets',
  ARRAY['getting-started', 'tutorial'],
  'Getting Started',
  3
);


-- ─────────────────────────────────────────────────────────────────────
-- AUTHENTICATION SECTION
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO notes (title, content, tags, section, "order") VALUES
(
  'Authentication Overview',
  '# Authentication Overview

The Codex API supports multiple authentication methods to suit different use cases. Choose the method that best fits your application''s security requirements.

## Authentication Methods

| Method | Best For | Security Level |
|--------|----------|----------------|
| [[API Keys]] | Server-to-server | High |
| [[OAuth 2.0]] | User authorization | Highest |

## Quick Comparison

### API Keys

- Simple to implement
- Best for backend services
- Single key per application
- See [[API Keys]] for setup

### OAuth 2.0

- Industry standard
- User-delegated access
- Granular permissions (scopes)
- See [[OAuth 2.0]] for implementation

## Security Best Practices

1. **Never expose credentials in client-side code**
2. **Rotate keys regularly** - We recommend every 90 days
3. **Use environment variables** - Never commit credentials to version control
4. **Implement proper scopes** - Request only the permissions you need
5. **Monitor API usage** - Set up alerts for unusual activity

## Request Headers

All authenticated requests must include the `Authorization` header:

```http
Authorization: Bearer YOUR_TOKEN_HERE
```

## Error Responses

Authentication failures return a `401 Unauthorized` response:

```json
{
  "error": {
    "code": "unauthorized",
    "message": "Invalid or expired authentication token",
    "details": {
      "reason": "token_expired"
    }
  }
}
```

See [[Error Handling]] for complete error documentation.

## Rate Limits by Auth Type

Different authentication methods have different rate limits:

| Auth Type | Requests/Hour | Burst Limit |
|-----------|---------------|-------------|
| API Key | 10,000 | 100/sec |
| OAuth 2.0 | 15,000 | 150/sec |

See [[Rate Limiting]] for more details.',
  ARRAY['authentication', 'security'],
  'Authentication',
  4
),
(
  'OAuth 2.0',
  '# OAuth 2.0

OAuth 2.0 is the recommended authentication method for applications that need to access user data on behalf of users.

## Supported Grant Types

- **Authorization Code** - For web applications with a backend
- **PKCE** - For mobile and single-page applications
- **Client Credentials** - For machine-to-machine communication

## Authorization Code Flow

### Step 1: Redirect to Authorization

```
GET https://auth.codex.dev/oauth/authorize
  ?client_id=YOUR_CLIENT_ID
  &redirect_uri=https://yourapp.com/callback
  &response_type=code
  &scope=read:users write:posts
  &state=random_state_string
```

### Step 2: Handle the Callback

After user authorization, we redirect to your `redirect_uri`:

```
https://yourapp.com/callback?code=AUTH_CODE&state=random_state_string
```

### Step 3: Exchange Code for Token

```bash
curl -X POST "https://auth.codex.dev/oauth/token" \
  -H "Content-Type: application/json" \
  -d ''{
    "grant_type": "authorization_code",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "code": "AUTH_CODE",
    "redirect_uri": "https://yourapp.com/callback"
  }''
```

### Token Response

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "dGhpcyBpcyBhIHJlZnJl...",
  "scope": "read:users write:posts"
}
```

## Available Scopes

| Scope | Description |
|-------|-------------|
| `read:users` | Read user profiles |
| `write:users` | Update user profiles |
| `read:posts` | Read posts |
| `write:posts` | Create and update posts |
| `read:comments` | Read comments |
| `write:comments` | Create and update comments |

## Refreshing Tokens

Access tokens expire after 1 hour. Use the refresh token to get a new access token:

```bash
curl -X POST "https://auth.codex.dev/oauth/token" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=YOUR_REFRESH_TOKEN" \
  -d "client_id=YOUR_CLIENT_ID"
```

## PKCE Flow

For public clients (mobile/SPA), use PKCE:

```javascript
// Generate code verifier and challenge
const verifier = generateRandomString(128);
const challenge = base64UrlEncode(sha256(verifier));

// Include in authorization request
const authUrl = `https://auth.codex.dev/oauth/authorize
  ?client_id=${clientId}
  &code_challenge=${challenge}
  &code_challenge_method=S256`;
```

See [[Authentication Overview]] for security best practices and [[API Keys]] for simpler authentication.',
  ARRAY['authentication', 'oauth'],
  'Authentication',
  5
),
(
  'API Keys',
  '# API Keys

API Keys provide a simple way to authenticate server-to-server requests. They''re ideal for backend services and scripts.

## Creating an API Key

1. Log in to the [Codex Dashboard](https://dashboard.codex.dev)
2. Navigate to **Settings** → **API Keys**
3. Click **Create New Key**
4. Give your key a descriptive name
5. Copy and securely store the key (it won''t be shown again)

## Using API Keys

Include your API key in the `Authorization` header:

```bash
curl -X GET "https://api.codex.dev/v1/users" \
  -H "Authorization: Bearer sk_live_abc123..."
```

### JavaScript Example

```javascript
const client = new CodexClient({
  apiKey: process.env.CODEX_API_KEY
});

const users = await client.users.list();
```

### Python Example

```python
import os
from codex import CodexClient

client = CodexClient(api_key=os.environ[''CODEX_API_KEY''])
users = client.users.list()
```

## Key Types

| Type | Prefix | Environment |
|------|--------|-------------|
| Live | `sk_live_` | Production |
| Test | `sk_test_` | Development |

## Security Guidelines

### Do

- ✅ Store keys in environment variables
- ✅ Use different keys for development and production
- ✅ Rotate keys every 90 days
- ✅ Set up IP allowlists for production keys

### Don''t

- ❌ Commit keys to version control
- ❌ Share keys between applications
- ❌ Use live keys in development
- ❌ Expose keys in client-side code

## Key Permissions

API keys have full access to your account. For granular permissions, consider [[OAuth 2.0]] with specific scopes.

## Revoking Keys

To revoke a compromised key:

1. Go to **Settings** → **API Keys**
2. Find the key and click **Revoke**
3. Create a new key and update your applications

## Rate Limits

API key requests are limited to 10,000 requests per hour. See [[Rate Limiting]] for details.

## Troubleshooting

### Invalid API Key

```json
{
  "error": {
    "code": "invalid_api_key",
    "message": "The provided API key is invalid or has been revoked"
  }
}
```

See [[Error Handling]] for all error codes and [[Authentication Overview]] for alternative auth methods.',
  ARRAY['authentication', 'api-keys'],
  'Authentication',
  6
);


-- ─────────────────────────────────────────────────────────────────────
-- API REFERENCE SECTION
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO notes (title, content, tags, section, "order") VALUES
(
  'Users API',
  '# Users API

The Users API allows you to manage user accounts, profiles, and relationships.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users |
| GET | `/users/:id` | Get a specific user |
| POST | `/users` | Create a new user |
| PUT | `/users/:id` | Update a user |
| DELETE | `/users/:id` | Delete a user |
| GET | `/users/me` | Get current user |

## List Users

Retrieve a paginated list of users.

```http
GET /v1/users
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | integer | Number of results (default: 20, max: 100) |
| `cursor` | string | Pagination cursor |
| `sort` | string | Sort field (`created_at`, `name`) |
| `order` | string | Sort order (`asc`, `desc`) |

### Request

```bash
curl -X GET "https://api.codex.dev/v1/users?limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Response

```json
{
  "data": [
    {
      "id": "usr_abc123",
      "name": "Jane Developer",
      "email": "jane@example.com",
      "avatar_url": "https://cdn.codex.dev/avatars/usr_abc123.jpg",
      "role": "admin",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-02-20T14:45:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "has_more": true,
    "next_cursor": "eyJpZCI6InVzcl94eXoifQ=="
  }
}
```

See [[Pagination]] for cursor-based pagination details.

## Get User

Retrieve a specific user by ID.

```http
GET /v1/users/:id
```

### Request

```bash
curl -X GET "https://api.codex.dev/v1/users/usr_abc123" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Response

```json
{
  "data": {
    "id": "usr_abc123",
    "name": "Jane Developer",
    "email": "jane@example.com",
    "avatar_url": "https://cdn.codex.dev/avatars/usr_abc123.jpg",
    "role": "admin",
    "bio": "Full-stack developer passionate about APIs",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-02-20T14:45:00Z"
  }
}
```

## Create User

Create a new user account.

```http
POST /v1/users
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | User''s display name |
| `email` | string | Yes | User''s email address |
| `password` | string | Yes | User''s password (min 8 chars) |
| `role` | string | No | User role (default: `user`) |

### Request

```bash
curl -X POST "https://api.codex.dev/v1/users" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d ''{
    "name": "John Smith",
    "email": "john@example.com",
    "password": "securepassword123"
  }''
```

### Response (201 Created)

```json
{
  "data": {
    "id": "usr_def456",
    "name": "John Smith",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2024-03-01T09:00:00Z"
  }
}
```

## Update User

Update an existing user.

```http
PUT /v1/users/:id
```

### Request

```bash
curl -X PUT "https://api.codex.dev/v1/users/usr_abc123" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d ''{ "name": "Jane Smith", "bio": "Updated bio" }''
```

## Delete User

Delete a user account.

```http
DELETE /v1/users/:id
```

### Request

```bash
curl -X DELETE "https://api.codex.dev/v1/users/usr_abc123" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Response (204 No Content)

No response body on successful deletion.

## Related

- [[Posts API]] - Manage user posts
- [[Comments API]] - Manage user comments
- [[Error Handling]] - Handle API errors',
  ARRAY['api-reference', 'users'],
  'API Reference',
  7
),
(
  'Posts API',
  '# Posts API

The Posts API enables creating, reading, updating, and deleting posts. Posts can be associated with users and contain comments.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts` | List all posts |
| GET | `/posts/:id` | Get a specific post |
| POST | `/posts` | Create a new post |
| PUT | `/posts/:id` | Update a post |
| DELETE | `/posts/:id` | Delete a post |
| GET | `/users/:id/posts` | Get posts by user |

## List Posts

Retrieve a paginated list of posts.

```http
GET /v1/posts
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | integer | Number of results (default: 20, max: 100) |
| `cursor` | string | Pagination cursor |
| `author_id` | string | Filter by author |
| `published` | boolean | Filter by publish status |
| `tag` | string | Filter by tag |

### Request

```bash
curl -X GET "https://api.codex.dev/v1/posts?limit=10&published=true" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Response

```json
{
  "data": [
    {
      "id": "pst_xyz789",
      "title": "Getting Started with Codex API",
      "slug": "getting-started-with-codex-api",
      "content": "Welcome to our comprehensive guide...",
      "excerpt": "Learn how to integrate the Codex API",
      "author": {
        "id": "usr_abc123",
        "name": "Jane Developer"
      },
      "tags": ["tutorial", "api"],
      "published": true,
      "published_at": "2024-02-15T12:00:00Z",
      "created_at": "2024-02-14T10:30:00Z",
      "updated_at": "2024-02-15T12:00:00Z"
    }
  ],
  "meta": {
    "total": 42,
    "has_more": true,
    "next_cursor": "eyJpZCI6InBzdF9hYmMifQ=="
  }
}
```

## Get Post

Retrieve a specific post by ID.

```http
GET /v1/posts/:id
```

### Request

```bash
curl -X GET "https://api.codex.dev/v1/posts/pst_xyz789" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Create Post

Create a new post.

```http
POST /v1/posts
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Post title |
| `content` | string | Yes | Post content (Markdown supported) |
| `excerpt` | string | No | Short description |
| `tags` | array | No | Array of tag strings |
| `published` | boolean | No | Publish immediately (default: false) |

### Request

```bash
curl -X POST "https://api.codex.dev/v1/posts" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d ''{
    "title": "My New Post",
    "content": "# Hello World\n\nThis is my first post!",
    "tags": ["announcement"],
    "published": true
  }''
```

### Response (201 Created)

```json
{
  "data": {
    "id": "pst_new123",
    "title": "My New Post",
    "slug": "my-new-post",
    "content": "# Hello World\n\nThis is my first post!",
    "author": {
      "id": "usr_abc123",
      "name": "Jane Developer"
    },
    "tags": ["announcement"],
    "published": true,
    "published_at": "2024-03-01T09:00:00Z",
    "created_at": "2024-03-01T09:00:00Z"
  }
}
```

## Update Post

Update an existing post.

```http
PUT /v1/posts/:id
```

### Request

```bash
curl -X PUT "https://api.codex.dev/v1/posts/pst_xyz789" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d ''{ "title": "Updated Title", "published": true }''
```

## Delete Post

Delete a post and all associated comments.

```http
DELETE /v1/posts/:id
```

### Request

```bash
curl -X DELETE "https://api.codex.dev/v1/posts/pst_xyz789" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Related

- [[Users API]] - Manage post authors
- [[Comments API]] - Manage post comments
- [[Pagination]] - Navigate large result sets',
  ARRAY['api-reference', 'posts'],
  'API Reference',
  8
),
(
  'Comments API',
  '# Comments API

The Comments API allows you to manage comments on posts. Comments support threading and can be nested.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts/:id/comments` | List comments on a post |
| GET | `/comments/:id` | Get a specific comment |
| POST | `/posts/:id/comments` | Create a comment |
| PUT | `/comments/:id` | Update a comment |
| DELETE | `/comments/:id` | Delete a comment |

## List Comments

Retrieve comments for a specific post.

```http
GET /v1/posts/:post_id/comments
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | integer | Number of results (default: 50, max: 100) |
| `cursor` | string | Pagination cursor |
| `sort` | string | Sort order (`newest`, `oldest`, `popular`) |
| `parent_id` | string | Filter by parent comment (for threads) |

### Request

```bash
curl -X GET "https://api.codex.dev/v1/posts/pst_xyz789/comments?sort=newest" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Response

```json
{
  "data": [
    {
      "id": "cmt_abc123",
      "content": "Great article! Very helpful.",
      "author": {
        "id": "usr_def456",
        "name": "John Reader"
      },
      "post_id": "pst_xyz789",
      "parent_id": null,
      "replies_count": 2,
      "likes_count": 15,
      "created_at": "2024-02-16T08:30:00Z",
      "updated_at": "2024-02-16T08:30:00Z"
    },
    {
      "id": "cmt_def456",
      "content": "Thanks for sharing!",
      "author": {
        "id": "usr_ghi789",
        "name": "Alice Commenter"
      },
      "post_id": "pst_xyz789",
      "parent_id": "cmt_abc123",
      "replies_count": 0,
      "likes_count": 3,
      "created_at": "2024-02-16T09:15:00Z"
    }
  ],
  "meta": {
    "total": 24,
    "has_more": false
  }
}
```

## Get Comment

Retrieve a specific comment by ID.

```http
GET /v1/comments/:id
```

### Request

```bash
curl -X GET "https://api.codex.dev/v1/comments/cmt_abc123" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Create Comment

Add a comment to a post.

```http
POST /v1/posts/:post_id/comments
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | Comment text |
| `parent_id` | string | No | Parent comment ID (for replies) |

### Request

```bash
curl -X POST "https://api.codex.dev/v1/posts/pst_xyz789/comments" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d ''{
    "content": "This is a great post!"
  }''
```

### Response (201 Created)

```json
{
  "data": {
    "id": "cmt_new789",
    "content": "This is a great post!",
    "author": {
      "id": "usr_abc123",
      "name": "Jane Developer"
    },
    "post_id": "pst_xyz789",
    "parent_id": null,
    "replies_count": 0,
    "likes_count": 0,
    "created_at": "2024-03-01T10:00:00Z"
  }
}
```

### Creating a Reply

```bash
curl -X POST "https://api.codex.dev/v1/posts/pst_xyz789/comments" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d ''{
    "content": "Thanks for your feedback!",
    "parent_id": "cmt_abc123"
  }''
```

## Update Comment

Update an existing comment (author only).

```http
PUT /v1/comments/:id
```

### Request

```bash
curl -X PUT "https://api.codex.dev/v1/comments/cmt_abc123" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d ''{ "content": "Updated comment text" }''
```

## Delete Comment

Delete a comment (author or post owner only).

```http
DELETE /v1/comments/:id
```

### Request

```bash
curl -X DELETE "https://api.codex.dev/v1/comments/cmt_abc123" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Related

- [[Posts API]] - Manage posts
- [[Users API]] - Manage comment authors
- [[Error Handling]] - Handle API errors',
  ARRAY['api-reference', 'comments'],
  'API Reference',
  9
);


-- ─────────────────────────────────────────────────────────────────────
-- GUIDES SECTION
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO notes (title, content, tags, section, "order") VALUES
(
  'Pagination',
  '# Pagination

The Codex API uses cursor-based pagination for efficient traversal of large datasets. This guide explains how to paginate through results.

## Cursor-Based Pagination

Cursor pagination provides consistent results even when data changes between requests. It''s more efficient than offset pagination for large datasets.

### How It Works

1. Make an initial request without a cursor
2. Use the `next_cursor` from the response for subsequent requests
3. Continue until `has_more` is `false`

### Example Flow

```javascript
async function getAllUsers() {
  const allUsers = [];
  let cursor = null;
  
  do {
    const response = await client.users.list({
      limit: 100,
      cursor: cursor
    });
    
    allUsers.push(...response.data);
    cursor = response.meta.next_cursor;
  } while (response.meta.has_more);
  
  return allUsers;
}
```

### Python Example

```python
def get_all_users():
    all_users = []
    cursor = None
    
    while True:
        response = client.users.list(limit=100, cursor=cursor)
        all_users.extend(response.data)
        
        if not response.meta.has_more:
            break
        cursor = response.meta.next_cursor
    
    return all_users
```

## Response Format

All paginated endpoints return a consistent structure:

```json
{
  "data": [...],
  "meta": {
    "total": 1500,
    "has_more": true,
    "next_cursor": "eyJpZCI6InVzcl94eXoiLCJjcmVhdGVkX2F0IjoiMjAyNC0wMS0xNSJ9"
  }
}
```

### Meta Fields

| Field | Type | Description |
|-------|------|-------------|
| `total` | integer | Total number of records |
| `has_more` | boolean | Whether more pages exist |
| `next_cursor` | string | Cursor for next page (null if no more) |

## Pagination Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `limit` | integer | 20 | 100 | Results per page |
| `cursor` | string | null | - | Pagination cursor |

## Best Practices

### Do

- ✅ Use reasonable page sizes (20-100 items)
- ✅ Store cursors if you need to resume pagination
- ✅ Handle empty results gracefully

### Don''t

- ❌ Parse or modify cursor values
- ❌ Assume cursor format is stable
- ❌ Use cursors across different queries

## Offset Pagination (Legacy)

Some endpoints support offset pagination for backwards compatibility:

```bash
curl "https://api.codex.dev/v1/users?page=2&per_page=20"
```

**Note**: Offset pagination is deprecated. Use cursor pagination for new integrations.

## Related

- [[Users API]] - Paginate user lists
- [[Posts API]] - Paginate post lists
- [[Error Handling]] - Handle pagination errors',
  ARRAY['guides', 'pagination'],
  'Guides',
  10
),
(
  'Error Handling',
  '# Error Handling

The Codex API uses conventional HTTP response codes and returns detailed error information in JSON format.

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `204` | No Content (successful deletion) |
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Invalid or missing auth |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn''t exist |
| `409` | Conflict - Resource already exists |
| `422` | Unprocessable Entity - Validation failed |
| `429` | Too Many Requests - Rate limited |
| `500` | Internal Server Error |

## Error Response Format

All errors follow a consistent structure:

```json
{
  "error": {
    "code": "validation_error",
    "message": "The request body contains invalid data",
    "details": {
      "field": "email",
      "reason": "invalid_format",
      "message": "Email must be a valid email address"
    }
  }
}
```

### Error Fields

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Machine-readable error code |
| `message` | string | Human-readable description |
| `details` | object | Additional context (optional) |

## Common Error Codes

### Authentication Errors

```json
{
  "error": {
    "code": "unauthorized",
    "message": "Invalid or expired authentication token"
  }
}
```

See [[Authentication Overview]] for auth setup.

### Validation Errors

```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "details": {
      "errors": [
        { "field": "email", "message": "is required" },
        { "field": "name", "message": "must be at least 2 characters" }
      ]
    }
  }
}
```

### Rate Limit Errors

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Too many requests",
    "details": {
      "retry_after": 60,
      "limit": 10000,
      "remaining": 0,
      "reset_at": "2024-03-01T10:00:00Z"
    }
  }
}
```

See [[Rate Limiting]] for limits and best practices.

### Not Found Errors

```json
{
  "error": {
    "code": "not_found",
    "message": "User not found",
    "details": {
      "resource": "user",
      "id": "usr_invalid123"
    }
  }
}
```

## Handling Errors in Code

### JavaScript

```javascript
try {
  const user = await client.users.get(''usr_123'');
} catch (error) {
  if (error.code === ''not_found'') {
    console.log(''User does not exist'');
  } else if (error.code === ''unauthorized'') {
    console.log(''Please check your API key'');
  } else {
    console.error(''Unexpected error:'', error.message);
  }
}
```

### Python

```python
from codex.exceptions import NotFoundError, UnauthorizedError

try:
    user = client.users.get(''usr_123'')
except NotFoundError:
    print(''User does not exist'')
except UnauthorizedError:
    print(''Please check your API key'')
except Exception as e:
    print(f''Unexpected error: {e}'')
```

## Retry Strategy

For transient errors (5xx, rate limits), implement exponential backoff:

```javascript
async function fetchWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status >= 500 || error.code === ''rate_limit_exceeded'') {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }
}
```

## Related

- [[Rate Limiting]] - Understand rate limits
- [[Authentication Overview]] - Fix auth errors
- [[API Keys]] - Manage API credentials',
  ARRAY['guides', 'errors'],
  'Guides',
  11
),
(
  'Rate Limiting',
  '# Rate Limiting

The Codex API implements rate limiting to ensure fair usage and maintain service quality for all users.

## Rate Limits

| Auth Type | Requests/Hour | Burst Limit |
|-----------|---------------|-------------|
| [[API Keys]] | 10,000 | 100/sec |
| [[OAuth 2.0]] | 15,000 | 150/sec |
| Unauthenticated | 100 | 10/sec |

## Rate Limit Headers

Every response includes rate limit information:

```http
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9542
X-RateLimit-Reset: 1709290800
```

### Header Descriptions

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests per hour |
| `X-RateLimit-Remaining` | Requests remaining in window |
| `X-RateLimit-Reset` | Unix timestamp when limit resets |

## Handling Rate Limits

When you exceed the rate limit, you''ll receive a `429 Too Many Requests` response:

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Please retry after 60 seconds.",
    "details": {
      "retry_after": 60,
      "limit": 10000,
      "remaining": 0,
      "reset_at": "2024-03-01T10:00:00Z"
    }
  }
}
```

### Retry-After Header

The response includes a `Retry-After` header indicating seconds to wait:

```http
Retry-After: 60
```

## Best Practices

### Implement Exponential Backoff

```javascript
async function requestWithBackoff(fn, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429) {
        const retryAfter = error.headers[''retry-after''] || Math.pow(2, attempt);
        console.log(`Rate limited. Retrying in ${retryAfter}s...`);
        await sleep(retryAfter * 1000);
        continue;
      }
      throw error;
    }
  }
  throw new Error(''Max retries exceeded'');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### Python Example

```python
import time
from codex.exceptions import RateLimitError

def request_with_backoff(fn, max_retries=5):
    for attempt in range(max_retries):
        try:
            return fn()
        except RateLimitError as e:
            retry_after = e.retry_after or (2 ** attempt)
            print(f''Rate limited. Retrying in {retry_after}s...'')
            time.sleep(retry_after)
    raise Exception(''Max retries exceeded'')
```

### Monitor Your Usage

Track your rate limit consumption:

```javascript
const response = await client.users.list();

const remaining = response.headers[''x-ratelimit-remaining''];
const limit = response.headers[''x-ratelimit-limit''];

console.log(`API calls: ${limit - remaining}/${limit}`);

if (remaining < 100) {
  console.warn(''Approaching rate limit!'');
}
```

## Increasing Limits

Need higher limits? Contact us:

- **Enterprise plans** - Custom rate limits available
- **Burst increases** - Temporary limit increases for launches
- **Dedicated infrastructure** - For high-volume applications

## Endpoint-Specific Limits

Some endpoints have additional limits:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /users` | 100 | per hour |
| `POST /posts` | 500 | per hour |
| Search endpoints | 1,000 | per hour |

## Related

- [[Error Handling]] - Handle rate limit errors
- [[Authentication Overview]] - Auth methods and limits
- [[API Keys]] - API key rate limits',
  ARRAY['guides', 'rate-limiting'],
  'Guides',
  12
);


-- ─────────────────────────────────────────────────────────────────────
-- INSERT LINKS (based on wikilinks in content)
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO links (source_title, target_title) VALUES
-- Introduction links
('Introduction', 'OAuth 2.0'),
('Introduction', 'API Keys'),
('Introduction', 'Rate Limiting'),
('Introduction', 'Error Handling'),
('Introduction', 'Quick Start'),
('Introduction', 'Authentication Overview'),
('Introduction', 'Users API'),
('Introduction', 'Posts API'),
('Introduction', 'Comments API'),
('Introduction', 'Installation'),

-- Installation links
('Installation', 'API Keys'),
('Installation', 'OAuth 2.0'),
('Installation', 'Quick Start'),
('Installation', 'Authentication Overview'),

-- Quick Start links
('Quick Start', 'Installation'),
('Quick Start', 'Authentication Overview'),
('Quick Start', 'Users API'),
('Quick Start', 'Error Handling'),
('Quick Start', 'Pagination'),

-- Authentication Overview links
('Authentication Overview', 'API Keys'),
('Authentication Overview', 'OAuth 2.0'),
('Authentication Overview', 'Error Handling'),
('Authentication Overview', 'Rate Limiting'),

-- OAuth 2.0 links
('OAuth 2.0', 'Authentication Overview'),
('OAuth 2.0', 'API Keys'),

-- API Keys links
('API Keys', 'OAuth 2.0'),
('API Keys', 'Rate Limiting'),
('API Keys', 'Error Handling'),
('API Keys', 'Authentication Overview'),

-- Users API links
('Users API', 'Pagination'),
('Users API', 'Posts API'),
('Users API', 'Comments API'),
('Users API', 'Error Handling'),

-- Posts API links
('Posts API', 'Users API'),
('Posts API', 'Comments API'),
('Posts API', 'Pagination'),

-- Comments API links
('Comments API', 'Posts API'),
('Comments API', 'Users API'),
('Comments API', 'Error Handling'),

-- Pagination links
('Pagination', 'Users API'),
('Pagination', 'Posts API'),
('Pagination', 'Error Handling'),

-- Error Handling links
('Error Handling', 'Rate Limiting'),
('Error Handling', 'Authentication Overview'),
('Error Handling', 'API Keys'),

-- Rate Limiting links
('Rate Limiting', 'API Keys'),
('Rate Limiting', 'OAuth 2.0'),
('Rate Limiting', 'Error Handling'),
('Rate Limiting', 'Authentication Overview');
