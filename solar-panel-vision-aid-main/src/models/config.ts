
// Configuration file for model paths and settings

// Model file paths - updated to use Hugging Face hosted models
export const MODEL_PATHS = {
  // YOLO model path from Hugging Face
  YOLO: 'https://huggingface.co/Mehhta/yolo_solar_classify/resolve/main/best.onnx',
  
  // Random Forest model path from Hugging Face
  RF: 'https://huggingface.co/Mehhta/rf_classify/resolve/main/rf_model.onnx',
  
  // Any additional models can be added here
  // EXAMPLE: SEGMENTATION: '/models/segmentation-model.onnx',
};

// Model settings and parameters
export const MODEL_SETTINGS = {
  // YOLO specific settings
  YOLO: {
    confidenceThreshold: 0.5,  // Minimum confidence score to keep a detection
    iouThreshold: 0.45,        // Intersection over Union threshold for NMS
    maxDetections: 100,        // Maximum number of detections to return
    inputSize: 640,            // Input image size for the model
  },
  
  // Random Forest specific settings
  RF: {
    featureThreshold: 0.3,     // Threshold for feature importance
    // Add any other RF model specific parameters here
  },
  
  // General settings
  processingTimeout: 30000,    // Processing timeout in milliseconds
};

// YOLO classification classes
export const YOLO_CLASSES = [
  'Bird-drop',
  'Dusty',
  'Clean',
  'Electrical-damage',
  'Physical-damage',
  'Snow'
];

// Damage type classification mapping (for RF model and final results)
export const DAMAGE_CLASSES = [
  'Bird-drop',
  'Dusty',
  'Clean',
  'Electrical-damage',
  'Physical-damage',
  'Snow'
];

// Feature extraction configuration for the RF model
export const FEATURE_CONFIG = {
  extractBoundingBoxFeatures: true,
  extractConfidenceScores: true,
  extractAreaRatios: true,
  extractPositionalData: true,
};

// Multi-label classification settings
export const MULTI_LABEL_CONFIG = {
  enableMultiLabel: true,     // Enable multi-label classification
  multiLabelThreshold: 0.3,   // Threshold for secondary classifications
  maxLabelsPerImage: 3,       // Maximum labels to assign to an image
};

// Damage impact on energy production (approximate percentage loss)
export const DAMAGE_IMPACT = {
  'Bird-drop': { min: 5, max: 15 },
  'Dusty': { min: 3, max: 12 },
  'Clean': { min: 0, max: 2 },
  'Electrical-damage': { min: 15, max: 30 },
  'Physical-damage': { min: 10, max: 25 },
  'Snow': { min: 20, max: 50 }
};

// Maintenance recommendation templates based on damage type
export const MAINTENANCE_RECOMMENDATIONS = {
  'Bird-drop': [
    "Clean panel surface to remove bird droppings",
    "Consider installing bird deterrents around your solar array",
    "Schedule regular cleaning every 3-6 months"
  ],
  'Dusty': [
    "Clean panel surface with soft brush and water",
    "Consider automated cleaning systems for dusty environments",
    "Increase cleaning frequency during dry seasons"
  ],
  'Clean': [
    "Continue regular maintenance schedule",
    "Monitor panel performance to ensure optimal efficiency",
    "Consider professional inspection annually"
  ],
  'Electrical-damage': [
    "Consult with a licensed electrician immediately",
    "Check for corrosion or damaged wiring",
    "Consider replacing affected components",
    "Avoid using panel until repaired to prevent safety hazards"
  ],
  'Physical-damage': [
    "Schedule professional inspection for physical damage repair",
    "Consider replacing damaged cells or the entire panel",
    "Check for water ingress in damaged areas",
    "Document damage for insurance purposes"
  ],
  'Snow': [
    "Remove snow accumulation carefully using appropriate tools",
    "Consider panel heating systems for snow-prone areas",
    "Install panels at steeper angles in regions with heavy snowfall",
    "Wait for natural melting if safe removal isn't possible"
  ]
};

// Analysis fallback configuration
export const FALLBACK_CONFIG = {
  useGeminiApiAsFallback: true,  // Enable Gemini API as a fallback when ML pipeline fails
  saveAnalysisHistory: true,     // Save analysis results to the database
};
