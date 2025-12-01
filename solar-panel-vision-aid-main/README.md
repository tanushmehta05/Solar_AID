
# Solar Vision AI

A comprehensive platform for solar panel analysis, optimization, and marketplace with Supabase integration.

## Project Overview

Solar Vision AI is a web application that uses AI to help solar panel owners analyze their panels, detect damage, optimize performance, and buy/sell solar panels in a marketplace. The application features:

- **AI-powered analysis tool**: Upload images of solar panels to detect damage and get optimization recommendations
- **Marketplace**: Buy and sell solar panels with AI-verified quality
- **AI Assistant**: Chat with an AI assistant to get help with solar panel questions
- **Optimization tools**: Get recommendations for optimal panel positioning based on location and condition
- **User Authentication**: Secure user authentication with Supabase
- **Admin Dashboard**: Admin portal for managing users, products, and analysis history

## Key Features

- **Dual-Mode Analysis**: Primary YOLO+RF ML pipeline with Gemini API fallback
- **Visual Mode Indicator**: Background turns green when using Gemini API fallback
- **Dark Mode Support**: Toggle between light and dark themes
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Interactive Animations**: Smooth transitions and visual feedback
- **OAuth Authentication**: Google & GitHub login options
- **Supabase Integration**: Secure database, storage, and authentication

## Model Information

The application uses two AI models hosted on Hugging Face:

1. **YOLO Model**: Used for object detection and damage classification
   - URL: https://huggingface.co/Mehhta/yolo_solar_classify/blob/main/best.onnx
   - The model file is directly loaded from Hugging Face

2. **Random Forest Model**: Used for detailed classification
   - URL: https://huggingface.co/Mehhta/rf_classify/blob/main/rf_model.onnx
   - The model file is directly loaded from Hugging Face

## API Key Configuration

For Gemini API fallback functionality:
1. Get a Gemini API key from: https://makersuite.google.com/app/apikey
2. Add your API key in `src/config/api-keys.ts`

```typescript
export const GEMINI_API_KEY = "your-api-key-here";
```

## Visual Indicators

- **Blue background**: ML pipeline is active and working
- **Green background**: Gemini API is being used as fallback

## Technology Stack

- **Frontend**: React.js, Tailwind CSS, shadcn/ui components
- **Authentication**: Supabase Auth (Email/Password, OAuth)
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Models**: ONNX Runtime, Hugging Face hosted models
- **AI Integration**: Gemini API (fallback)
- **State Management**: React Query, React Context
- **Visualization**: Recharts
- **Maps & Geolocation**: Leaflet, OpenStreetMap

## File Structure and Components

### Core Structure

- **src/pages/**
  - `Index.tsx` - Main landing page with feature overview
  - `Marketplace.tsx` - Solar panel marketplace where users can buy and sell panels
  - `Analysis.tsx` - Dedicated page for solar panel analysis (handles ML pipeline and Gemini API fallback)
  - `Chat.tsx` - AI assistant chat interface
  - `Optimization.tsx` - Solar panel optimization tools
  - `Auth.tsx` - Authentication page with login and signup
  - `Admin.tsx` - Admin dashboard for managing users and products
  - `NotFound.tsx` - 404 page

### Components

- **src/components/**
  - `Layout.tsx` - Main layout component with header and footer
  - `ImageUpload.tsx` - Component for uploading images
  - `ProcessingPipeline.tsx` - Visualizes the AI analysis pipeline
  - `AnalysisResult.tsx` - Displays analysis results
  - `PanelOptimization.tsx` - Panel optimization tools
  - `UserMenu.tsx` - User profile dropdown menu
  - `AuthGuard.tsx` - Component to protect routes that require authentication
  - `theme-provider.tsx` - Manages light/dark theme
  - `theme-toggle.tsx` - Component for toggling between themes
  - **/marketplace/** - Components specific to the marketplace
    - `ProductCard.tsx` - Card component for displaying products

### Models and Services

- **src/models/**
  - `pipeline.ts` - ML pipeline implementation
  - `yoloModel.ts` - YOLO model implementation
  - `rfModel.ts` - Random Forest model implementation
  - `config.ts` - Configuration for the ML models
  - `multiLabelBinarizer.ts` - Utility for multi-label classification

- **src/services/**
  - `modelService.ts` - Service for AI model analysis
  - `chatService.ts` - Service for chat functionality with Gemini AI

### Context and Authentication

- **src/contexts/**
  - `AuthContext.tsx` - Authentication context provider

### Configuration

- **src/config/**
  - `api-keys.ts` - Configuration for API keys (Gemini API)

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/solar-vision-ai.git
   cd solar-vision-ai
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Configure API key (Optional)
   - Open `src/config/api-keys.ts`
   - Add your Gemini API key for chat and fallback analysis
   ```javascript
   export const GEMINI_API_KEY = "your-gemini-api-key-here";
   ```

4. Set up Supabase
   - Create a new Supabase project
   - Run the SQL migrations from the repository
   - Update the Supabase URL and key in the application

5. Start the development server
   ```
   npm run dev
   ```

6. Open your browser to `http://localhost:5173`

## ML Pipeline

The application uses a two-stage ML pipeline:
1. YOLO model for initial damage detection
2. Random Forest for detailed analysis and classification

If the ML pipeline fails (due to model loading issues or errors), the application will automatically fall back to using the Gemini API if configured. The background of the analysis page will turn green to visually indicate when the Gemini API is being used instead of the ML pipeline.

## How it Works

### Analysis Process

1. User uploads an image of a solar panel
2. The system attempts to process the image using the YOLO+RF pipeline:
   - YOLO model detects damaged areas and provides initial classification
   - RF model refines classification and estimates energy loss
3. If ML pipeline fails, the system falls back to Gemini API (if configured)
4. Results are displayed with damage type, confidence level, and maintenance recommendations
5. Analysis history is saved to the user's account

### Authentication Flow

1. Users can sign up with email/password, Google, or GitHub
2. Admin user is automatically created for the specified admin email
3. Authentication state is managed globally with AuthContext
4. Protected routes use AuthGuard component to restrict access

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
