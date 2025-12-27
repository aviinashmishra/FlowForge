# FlowForge - Visual Data Pipeline Builder

A real-time collaborative visual data pipeline builder that enables data engineers and analysts to create, execute, and debug data transformations through an intuitive node-based interface.

## Features

- 🎨 **Visual Pipeline Builder**: Drag-and-drop interface with 15+ transformation nodes
- 👥 **Real-time Collaboration**: Multi-user editing with live cursor tracking
- 👁️ **Live Data Previews**: Instant data previews at every pipeline stage
- ⚡ **Browser Execution**: Client-side pipeline execution using Web Workers
- 🔄 **Version Control**: Automatic versioning with visual diff comparison
- 📤 **Code Export**: Generate JavaScript, Python, and SQL code
- 📱 **Responsive Design**: Optimized for tablets and laptops
- 🎨 **Purple Theme**: Beautiful, modern interface design
- 🔐 **Authentication**: Secure user authentication with JWT
- 📊 **Dashboard**: Comprehensive analytics and monitoring
- 👤 **Profile Management**: User profiles with settings and preferences

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, ReactFlow
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **State Management**: Zustand
- **Real-time**: Socket.IO
- **Testing**: Jest, fast-check (property-based testing)
- **Execution**: Web Workers

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or use the provided Neon database)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aviinashmishra/FlowForge.git
   cd FlowForge
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database URL and other configuration.

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Run database migrations:
   ```bash
   npx prisma db push
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Deployment

### Deploy to Vercel

1. **Fork/Clone the repository** to your GitHub account

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js project

3. **Set Environment Variables** in Vercel dashboard:
   ```
   DATABASE_URL=your_postgresql_database_url
   JWT_SECRET=your_secure_jwt_secret_key
   JWT_EXPIRES_IN=7d
   NEXTAUTH_URL=https://your-app-name.vercel.app
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. **Deploy**: Vercel will automatically build and deploy your application

### Environment Variables Required

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secure random string for JWT signing
- `JWT_EXPIRES_IN`: JWT expiration time (e.g., "7d")
- `NEXTAUTH_URL`: Your application URL
- `NEXTAUTH_SECRET`: NextAuth.js secret key

### Database Setup

The application uses PostgreSQL. You can use:
- **Neon** (recommended): Free PostgreSQL hosting
- **Supabase**: PostgreSQL with additional features
- **Railway**: Simple database hosting
- **Your own PostgreSQL instance**

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard pages
│   └── builder/        # Pipeline builder
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── canvas/         # ReactFlow canvas components
│   ├── dashboard/      # Dashboard components
│   ├── landing/        # Landing page components
│   ├── nodes/          # Node type components
│   └── ui/             # Reusable UI components
├── lib/                # Utility functions and services
├── stores/             # Zustand state stores
├── workers/            # Web Workers for execution
├── types/              # TypeScript type definitions
├── __tests__/          # Test files
└── prisma/             # Database schema and migrations
```

## Features Overview

### Authentication System
- User registration and login
- JWT-based authentication
- Password reset functionality
- Protected routes

### Dashboard
- User profile management
- Analytics and monitoring
- Activity tracking
- Settings management

### Pipeline Builder
- Visual node-based interface
- Real-time collaboration
- Data transformation nodes
- Code export capabilities

## Development

This project follows a spec-driven development approach. See the `.kiro/specs/` directory for detailed requirements, design, and implementation tasks for each feature.

## Contributing

1. Follow the implementation tasks in the respective `tasks.md` files
2. Write tests for all new features
3. Ensure all tests pass before submitting
4. Follow the established code style and conventions

## License

MIT License - see LICENSE file for details.