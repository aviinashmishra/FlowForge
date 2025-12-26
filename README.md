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

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, ReactFlow
- **State Management**: Zustand
- **Real-time**: Socket.IO
- **Testing**: Jest, fast-check (property-based testing)
- **Execution**: Web Workers

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── canvas/         # ReactFlow canvas components
│   ├── nodes/          # Node type components
│   ├── ui/             # Reusable UI components
│   └── layout/         # Layout components
├── stores/             # Zustand state stores
├── workers/            # Web Workers for execution
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
└── __tests__/          # Test files
```

## Development

This project follows a spec-driven development approach. See the `.kiro/specs/flowforge-pipeline-builder/` directory for detailed requirements, design, and implementation tasks.

## Contributing

1. Follow the implementation tasks in `tasks.md`
2. Write tests for all new features
3. Ensure all tests pass before submitting
4. Follow the established code style and conventions

## License

MIT License - see LICENSE file for details.