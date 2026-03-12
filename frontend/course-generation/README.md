# Career Sync - Course Generation Platform

A comprehensive online learning platform with course creation, learning journeys, and educator tools.

## 🏗 Architecture

```
unfold-clone/
├── frontend/          # Next.js 14 + TypeScript + Tailwind CSS
├── backend/           # Express.js + TypeScript + PostgreSQL
├── database/          # SQL schema and seeds
└── docker-compose.yml # Docker orchestration
```

## 🚀 Quick Start

### Using Docker (Recommended)

1. Make sure Docker and Docker Compose are installed

2. Start all services:
```bash
docker-compose up -d
```

This will start:
- **PostgreSQL** on port 5432 (auto-initialized with schema and seed data)
- **Backend API** on port 5000
- **Frontend** on port 3000

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:5432

### Manual Setup

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your database credentials
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

#### Database

```bash
# Create database
createdb unfold_db

# Run schema
psql unfold_db < database/schema.sql

# Run seeds
psql unfold_db < database/seeds.sql
```

## 📁 Project Structure

### Frontend (`/frontend`)
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Axios** for API calls
- **SWR** for data fetching

### Backend (`/backend`)
- **Express.js** REST API
- **TypeScript** for type safety
- **PostgreSQL** database
- **JWT** authentication
- **Zod** validation

### Database (`/database`)
- **PostgreSQL 16**
- Complete schema with indexes
- Sample data seeds
- Automated triggers

## 🔑 Demo Accounts

All passwords: `password123`

- **Learner**: learner@example.com
- **Educator**: educator@example.com (Studio access)
- **Admin**: admin@example.com

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile

### Learning Journeys
- `GET /api/learning-journeys` - List all
- `GET /api/learning-journeys/:slug` - Get by slug
- `POST /api/learning-journeys` - Create (auth required)
- `PUT /api/learning-journeys/:id` - Update (auth required)
- `DELETE /api/learning-journeys/:id` - Delete (auth required)

### Courses
- `GET /api/courses` - List all
- `GET /api/courses/:slug` - Get by slug
- `POST /api/courses` - Create (auth required)
- `PUT /api/courses/:id` - Update (auth required)
- `DELETE /api/courses/:id` - Delete (auth required)

### Topics
- `GET /api/topics` - Get all topics

## 🌟 Features

- ✅ User authentication & authorization
- ✅ Role-based access control (learner, educator, admin)
- ✅ Learning journeys with multiple courses
- ✅ Course creation and management
- ✅ Topic categorization (30+ topics)
- ✅ Search and filtering
- ✅ Infinite scroll for courses
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Educator studio dashboard
- ✅ Real-time search
- ✅ Protected routes

## 🛠 Development

### Backend
```bash
cd backend
npm run dev        # Start dev server
npm run build      # Build for production
npm start          # Start production server
```

### Frontend
```bash
cd frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm start          # Start production server
```

### Docker
```bash
docker-compose up -d           # Start all services
docker-compose down            # Stop all services
docker-compose logs -f         # View logs
docker-compose restart         # Restart services
```

## 📦 Tech Stack

**Frontend:**
- Next.js 14
- TypeScript
- Tailwind CSS
- Axios
- SWR

**Backend:**
- Express.js
- TypeScript
- PostgreSQL
- JWT
- Zod

**DevOps:**
- Docker
- Docker Compose

## 📝 License

MIT
