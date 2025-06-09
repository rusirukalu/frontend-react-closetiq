# ClosetIQ Frontend - React TypeScript Application

A modern, responsive React frontend application for ClosetIQ's AI-powered fashion platform. Built with Vite, TypeScript, and Tailwind CSS, this application provides an intuitive interface for fashion classification, style recommendations, and wardrobe management.

## **Features**

- **AI Fashion Classification**: Upload and classify clothing items with detailed attribute analysis
- **Smart Recommendations**: Get personalized fashion recommendations based on your style preferences
- **Digital Wardrobe**: Organize and manage your clothing collection digitally
- **Style Analytics**: Track your fashion choices and style evolution
- **AI Chat Assistant**: Interactive fashion advice and styling suggestions
- **User Authentication**: Secure login and registration with Firebase
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## **Tech Stack**

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Authentication**: Firebase Auth
- **UI Components**: Custom component library with shadcn/ui
- **Routing**: React Router
- **HTTP Client**: Axios
- **Development**: ESLint, PostCSS

## **Project Structure**

```
frontend-react-closetiq/
├── public/                     # Static assets
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── analytics/         # Analytics dashboard components
│   │   ├── auth/             # Authentication forms
│   │   ├── chat/             # AI chat interface
│   │   ├── classification/   # Image upload and results
│   │   ├── common/           # Shared components
│   │   ├── landing/          # Landing page sections
│   │   ├── layout/           # Layout components
│   │   ├── recommendations/  # Recommendation displays
│   │   ├── ui/              # Base UI components
│   │   └── wardrobe/        # Wardrobe management
│   ├── config/              # Configuration files
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   ├── pages/               # Page components
│   ├── services/            # API and external services
│   ├── store/               # Redux store and slices
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── .env                     # Environment variables
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## **Prerequisites**

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Firebase** project for authentication

## **Installation \& Setup**

### **1. Clone the Repository**

```bash
git clone <repository-url>
cd frontend-react-closetiq
```

### **2. Install Dependencies**

```bash
npm install
# or
yarn install
```

### **3. Environment Configuration**

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_AI_SERVICE_URL=http://localhost:5000/api/ai

# Application Configuration
VITE_APP_NAME=ClosetIQ
VITE_APP_VERSION=1.0.0
```

### **4. Start Development Server**

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## **Available Scripts**

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## **Core Components**

### **Authentication System**

- **LoginForm**: User authentication with Firebase
- **RegisterForm**: New user registration
- **ProtectedRoutes**: Route protection for authenticated users

### **Fashion Classification**

- **ImageUpload**: Drag-and-drop image upload interface
- **ClassificationResults**: Display AI classification results with confidence scores

### **AI Chat Interface**

- **ChatInterface**: Real-time fashion advice and styling suggestions

### **Wardrobe Management**

- **WardrobeGallery**: Visual grid of user's clothing items
- **Analytics Dashboard**: Style insights and wearing patterns

### **UI Component Library**

- **Base Components**: Button, Input, Card, Dialog, Badge
- **Layout Components**: Navigation, Dashboard Layout
- **Utility Components**: Loading Spinner, Toast notifications

## **State Management**

The application uses Redux Toolkit for state management with the following slices:

- **authSlice**: User authentication state
- **clothingSlice**: Clothing items and classification data
- **wardrobeSlice**: Wardrobe organization and management
- **recommendationSlice**: Fashion recommendations
- **chatSlice**: Chat history and AI interactions
- **uiSlice**: UI state and notifications

## **API Integration**

### **Services Architecture**

- **apiClient**: Centralized HTTP client with interceptors
- **authService**: Authentication and user management
- **aiService**: AI classification and recommendation endpoints

### **Key API Endpoints**

```typescript
// Classification
POST /api/classify
POST /api/analyze-style

// Recommendations
GET /api/recommendations
POST /api/recommendations/generate

// Wardrobe
GET /api/wardrobe
POST /api/wardrobe/items
PUT /api/wardrobe/items/:id
DELETE /api/wardrobe/items/:id

// Chat
POST /api/chat/message
GET /api/chat/history
```

## **Styling \& Design System**

### **Tailwind CSS Configuration**

The project uses a custom Tailwind configuration with:

- **Custom Color Palette**: Brand-specific colors for fashion industry
- **Typography Scale**: Optimized for readability across devices
- **Component Classes**: Reusable utility classes for common patterns
- **Responsive Breakpoints**: Mobile-first responsive design

### **Design Principles**

- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimized images and lazy loading
- **User Experience**: Intuitive navigation and clear visual hierarchy

## **Development Guidelines**

### **Code Organization**

- **Components**: Single responsibility principle with TypeScript interfaces
- **Hooks**: Custom hooks for reusable logic
- **Services**: Separation of concerns for API interactions
- **Types**: Comprehensive TypeScript definitions

### **Best Practices**

- **Component Structure**: Functional components with hooks
- **State Management**: Use Redux for global state, local state for component-specific data
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance**: React.memo, useMemo, and useCallback for optimization

## **Testing**

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## **Building for Production**

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` directory, optimized for deployment.

## **Deployment**

### **Environment Setup**

1. Configure production environment variables
2. Update API endpoints for production backend
3. Set up Firebase project for production

### **Build Optimization**

- **Code Splitting**: Automatic route-based code splitting
- **Asset Optimization**: Image compression and lazy loading
- **Bundle Analysis**: Use `npm run build -- --analyze` to analyze bundle size

## **Browser Support**

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

## **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Follow the coding standards and run linting
4. Write tests for new functionality
5. Commit your changes (`git commit -am 'Add new feature'`)
6. Push to the branch (`git push origin feature/new-feature`)
7. Create a Pull Request

## **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## **Support**

For questions and support, please open an issue in the repository or contact the development team.
