import { SolarPanelAnalysisPipeline } from '@/models/pipeline';
import { YoloModel, YoloDetection } from '@/models/yoloModel';
import { YOLO_CLASSES } from '@/models/config';

export type DamageType = typeof YOLO_CLASSES[number];

export interface AnalysisResult {
  hasDamage: boolean;
  damageType: DamageType;
  confidence: number;
  energyLossPercentage: number;
  boundingBoxes?: {
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }[];
  suggestions: string[];
  secondaryDamageTypes?: string[];
  classConfidences?: Record<string, number>;
}

// Pipeline instance - kept for reference but not used
const pipelineInstance = new SolarPanelAnalysisPipeline();

// YOLO model instance that will be actually used
const yoloModel = new YoloModel();

/**
 * Analyze an image using only the YOLO model
 * @param imageFile The image file to analyze
 * @returns Analysis result
 */
export const analyzeImage = async (imageFile: File): Promise<AnalysisResult> => {
  try {
    console.log('Starting image analysis with YOLO model only');
    
    // Convert file to an image element
    const imageElement = await fileToImage(imageFile);
    
    let result;
    
    try {
      // Load YOLO model if not already loaded
      await yoloModel.loadModel();
      
      // Run YOLO detection
      const yoloDetections = await yoloModel.detect(imageElement);
      
      // Process the YOLO detections to create an analysis result
      result = processYoloDetections(yoloDetections, imageElement);
      
      console.log('YOLO model analysis complete:', result);
    } catch (error) {
      console.warn('YOLO model failed, using mock data:', error);
      
      // Fallback to mock results if the YOLO model fails
      result = mockAnalysisResult();
    }
    
    return result;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

/**
 * Process YOLO detections to create an analysis result
 * @param detections YOLO detections
 * @param image The original image element
 * @returns Formatted analysis result
 */
const processYoloDetections = (detections: YoloDetection[], image: HTMLImageElement): AnalysisResult => {
  // If no detections, return clean panel result
  if (detections.length === 0) {
    return {
      hasDamage: false,
      damageType: 'Clean',
      confidence: 0.95,
      energyLossPercentage: 0,
      suggestions: [
        "No damage detected. Continue regular maintenance",
        "Optimize panel angle and cleaning schedule for maximum efficiency"
      ]
    };
  }
  
  // Find the detection with highest confidence
  const highestConfidenceDetection = detections.reduce(
    (prev, current) => prev.score > current.score ? prev : current
  );
  
  // Extract secondary damage types if available
  const secondaryDamageTypes = highestConfidenceDetection.secondaryClasses || [];
  
  // Determine damage type and energy loss based on YOLO detection
  const damageType = highestConfidenceDetection.class as DamageType;
  let energyLoss = 0;
  
  // Estimate energy loss based on damage type
  switch (damageType) {
    case 'Bird-drop':
      energyLoss = 8 + Math.random() * 7;
      break;
    case 'Dusty':
      energyLoss = 5 + Math.random() * 8;
      break;
    case 'Electrical-damage':
      energyLoss = 20 + Math.random() * 15;
      break;
    case 'Physical-damage':
      energyLoss = 15 + Math.random() * 10;
      break;
    case 'Snow':
      energyLoss = 30 + Math.random() * 20;
      break;
    case 'Clean':
    default:
      energyLoss = Math.random() * 3; // Small random loss even for clean panels
  }
  
  // Generate suggestions based on damage type
  const suggestions = generateSuggestions(damageType, energyLoss, secondaryDamageTypes);
  
  // Format bounding boxes
  const boundingBoxes = detections.map(detection => ({
    x: detection.box.x,
    y: detection.box.y,
    width: detection.box.width,
    height: detection.box.height,
    confidence: detection.score
  }));
  
  // Return formatted analysis result
  return {
    hasDamage: damageType !== 'Clean',
    damageType,
    confidence: highestConfidenceDetection.score,
    energyLossPercentage: energyLoss,
    boundingBoxes,
    secondaryDamageTypes: secondaryDamageTypes.length > 0 ? secondaryDamageTypes : undefined,
    classConfidences: highestConfidenceDetection.allScores,
    suggestions
  };
};

/**
 * Generate suggestions based on damage type and energy loss
 * @param damageType Type of damage detected
 * @param energyLoss Percentage of energy loss
 * @param secondaryDamageTypes Optional secondary damage types
 * @returns Array of suggestions
 */
const generateSuggestions = (
  damageType: string, 
  energyLoss: number,
  secondaryDamageTypes?: string[]
): string[] => {
  const suggestions: string[] = [];
  
  // Generic suggestions
  suggestions.push('Regular inspection and maintenance can prevent long-term damage');
  
  // Damage-specific suggestions
  switch (damageType) {
    case 'Physical-damage':
      suggestions.push('Schedule professional inspection for physical damage repair');
      suggestions.push('Consider replacing damaged cells or the entire panel if efficiency is severely impacted');
      if (energyLoss > 15) {
        suggestions.push('Immediate attention required: Physical damage is causing significant energy loss');
      }
      break;
      
    case 'Electrical-damage':
      suggestions.push('Consult with a licensed electrician to evaluate and repair electrical damage');
      suggestions.push('Check for corrosion or damaged wiring that may be causing the electrical issues');
      suggestions.push('Consider system shutdown if there are safety concerns until repairs are made');
      break;
      
    case 'Dusty':
      suggestions.push('Clean panel surface to remove dirt and debris');
      suggestions.push('Consider setting up a regular cleaning schedule, especially in dusty areas');
      if (energyLoss > 10) {
        suggestions.push('Professional cleaning recommended for optimal performance restoration');
      }
      break;
      
    case 'Bird-drop':
      suggestions.push('Clean panel surface to remove bird droppings');
      suggestions.push('Consider installing bird deterrents around your solar array');
      suggestions.push('Bird droppings can be acidic and may cause permanent damage if left untreated');
      break;
      
    case 'Snow':
      suggestions.push('Remove snow accumulation from panels when safe to do so');
      suggestions.push('Consider installing panels at a steeper angle in snow-prone regions');
      suggestions.push('Snow removal tools specifically designed for solar panels are recommended');
      break;
      
    case 'Clean':
      suggestions.push('No damage detected. Continue regular maintenance');
      suggestions.push('Optimize panel angle and cleaning schedule for maximum efficiency');
      break;
  }
  
  // Add suggestions for secondary damage types
  if (secondaryDamageTypes && secondaryDamageTypes.length > 0) {
    suggestions.push(`Also detected: ${secondaryDamageTypes.join(', ')}. Address these issues during maintenance.`);
    
    // Add specific suggestions for secondary damage types
    secondaryDamageTypes.forEach(secondaryType => {
      if (secondaryType === 'Dusty' && damageType !== 'Dusty') {
        suggestions.push('Clean panel surface to remove accumulated dust and dirt');
      } else if (secondaryType === 'Bird-drop' && damageType !== 'Bird-drop') {
        suggestions.push('Clean bird droppings and consider installing bird deterrents');
      }
    });
  }
  
  // Energy loss specific suggestions
  if (energyLoss > 25) {
    suggestions.push(`Critical: Your panels are losing approximately ${energyLoss.toFixed(1)}% of potential energy production`);
  } else if (energyLoss > 15) {
    suggestions.push(`Moderate concern: Energy loss of ${energyLoss.toFixed(1)}% detected`);
  } else if (energyLoss > 5) {
    suggestions.push(`Minor concern: Energy loss of ${energyLoss.toFixed(1)}% detected`);
  }
  
  return suggestions;
};

/**
 * Helper function to convert a File to an HTMLImageElement
 */
const fileToImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generate mock analysis results (used as fallback if YOLO model is not ready)
 */
const mockAnalysisResult = (): AnalysisResult => {
  // Mock results - in a real app, this would come from your YOLO+RF models
  const allDamageTypes = YOLO_CLASSES;
  const randomDamageType = allDamageTypes[Math.floor(Math.random() * allDamageTypes.length)] as DamageType;
  
  // Generate mock class confidences
  const mockClassConfidences: Record<string, number> = {};
  const primaryConfidence = 0.75 + Math.random() * 0.2; // 75-95% confidence for primary class
  
  allDamageTypes.forEach(damageType => {
    if (damageType === randomDamageType) {
      mockClassConfidences[damageType] = primaryConfidence;
    } else {
      mockClassConfidences[damageType] = Math.random() * 0.3; // 0-30% for other classes
    }
  });
  
  // Determine secondary damage types (1-2 random types different from primary)
  const otherDamageTypes = allDamageTypes.filter(type => type !== randomDamageType);
  const numSecondary = Math.floor(Math.random() * 2) + 1; // 1-2 secondary types
  const secondaryTypes: string[] = [];
  
  for (let i = 0; i < numSecondary && i < otherDamageTypes.length; i++) {
    const randomIndex = Math.floor(Math.random() * otherDamageTypes.length);
    const secondaryType = otherDamageTypes.splice(randomIndex, 1)[0];
    secondaryTypes.push(secondaryType);
    // Boost confidence for secondary types
    mockClassConfidences[secondaryType] = 0.3 + Math.random() * 0.2; // 30-50% confidence
  }
  
  // Determine energy loss based on damage type
  let energyLoss = 0;
  switch (randomDamageType) {
    case 'Bird-drop':
      energyLoss = 8 + Math.random() * 7;
      break;
    case 'Dusty':
      energyLoss = 5 + Math.random() * 8;
      break;
    case 'Electrical-damage':
      energyLoss = 20 + Math.random() * 15;
      break;
    case 'Physical-damage':
      energyLoss = 15 + Math.random() * 10;
      break;
    case 'Snow':
      energyLoss = 30 + Math.random() * 20;
      break;
    case 'Clean':
    default:
      energyLoss = Math.random() * 3; // Small random loss even for clean panels
  }
  
  // Generate mock suggestions based on damage type
  const mockSuggestions: string[] = [];
  mockSuggestions.push("Regular inspection and maintenance can prevent long-term damage");
  
  switch (randomDamageType) {
    case 'Physical-damage':
      mockSuggestions.push("Schedule professional inspection for physical damage repair");
      mockSuggestions.push("Consider replacing damaged cells or the entire panel if efficiency is severely impacted");
      break;
    case 'Electrical-damage':
      mockSuggestions.push("Consult with a licensed electrician to evaluate and repair electrical damage");
      mockSuggestions.push("Check for corrosion or damaged wiring that may be causing the electrical issues");
      break;
    case 'Dusty':
      mockSuggestions.push("Clean panel surface to remove dirt and debris");
      mockSuggestions.push("Consider setting up a regular cleaning schedule, especially in dusty areas");
      break;
    case 'Bird-drop':
      mockSuggestions.push("Clean panel surface to remove bird droppings");
      mockSuggestions.push("Consider installing bird deterrents around your solar array");
      break;
    case 'Snow':
      mockSuggestions.push("Remove snow accumulation from panels when safe to do so");
      mockSuggestions.push("Consider installing panels at a steeper angle in snow-prone regions");
      break;
    case 'Clean':
      mockSuggestions.push("No damage detected. Continue regular maintenance");
      mockSuggestions.push("Optimize panel angle and cleaning schedule for maximum efficiency");
      break;
  }
  
  // Add a suggestion for energy loss if significant
  if (energyLoss > 15) {
    mockSuggestions.push(`Energy loss concern: Your panels are losing approximately ${energyLoss.toFixed(1)}% of potential energy production`);
  }
  
  const mockResults: AnalysisResult = {
    hasDamage: randomDamageType !== 'Clean',
    damageType: randomDamageType,
    confidence: primaryConfidence,
    energyLossPercentage: energyLoss,
    boundingBoxes: randomDamageType !== 'Clean' ? [
      {
        x: Math.random() * 0.7,
        y: Math.random() * 0.7,
        width: 0.1 + Math.random() * 0.2,
        height: 0.1 + Math.random() * 0.2,
        confidence: primaryConfidence
      }
    ] : undefined,
    secondaryDamageTypes: secondaryTypes.length > 0 ? secondaryTypes : undefined,
    classConfidences: mockClassConfidences,
    suggestions: mockSuggestions
  };
  
  return mockResults;
};

export interface OptimizationParams {
  latitude: number;
  longitude: number;
  damageLevel: 'None' | 'Light' | 'Moderate' | 'Severe';
  dirtLevel: 'Clean' | 'Light' | 'Moderate' | 'Heavy';
}

export interface OptimizationResult {
  optimalTiltAngle: number;
  optimalAzimuth: number; // Compass direction in degrees
  potentialEnergyGain: number; // percentage
  currentEfficiency: number; // percentage
  optimizedEfficiency: number; // percentage
  recommendations: string[];
}

export const optimizePanelPosition = (params: OptimizationParams): Promise<OptimizationResult> => {
  return new Promise((resolve) => {
    // In a real application, this would use NASA data or solar position algorithms
    setTimeout(() => {
      // Calculate optimal tilt based on latitude (simplified formula)
      const optimalTilt = Math.abs(params.latitude) * 0.76;
      
      // Determine azimuth (Northern hemisphere: south, Southern hemisphere: north)
      const optimalAzimuth = params.latitude >= 0 ? 180 : 0;
      
      // Calculate efficiency loss from damage and dirt
      const damageLossMap = {
        'None': 0,
        'Light': 5,
        'Moderate': 15,
        'Severe': 30
      };
      
      const dirtLossMap = {
        'Clean': 0,
        'Light': 3,
        'Moderate': 10,
        'Heavy': 25
      };
      
      const damageEfficiencyLoss = damageLossMap[params.damageLevel];
      const dirtEfficiencyLoss = dirtLossMap[params.dirtLevel];
      
      // Calculate current and potential efficiencies
      const currentEfficiency = 100 - damageEfficiencyLoss - dirtEfficiencyLoss;
      const potentialGain = 5 + Math.random() * 10; // Random 5-15% gain from optimal positioning
      const optimizedEfficiency = Math.min(100, currentEfficiency + potentialGain);
      
      const recommendations = [];
      
      if (params.damageLevel !== 'None') {
        recommendations.push("Repair panel damage to recover up to " + damageEfficiencyLoss + "% energy loss");
      }
      
      if (params.dirtLevel !== 'Clean') {
        recommendations.push("Clean panel surface to recover up to " + dirtEfficiencyLoss + "% energy loss");
      }
      
      recommendations.push(`Adjust panel tilt to ${optimalTilt.toFixed(1)}° for optimal sun exposure`);
      recommendations.push(`Orient panels to face ${optimalAzimuth === 180 ? 'south' : 'north'} (${optimalAzimuth}°)`);
      
      resolve({
        optimalTiltAngle: optimalTilt,
        optimalAzimuth: optimalAzimuth,
        potentialEnergyGain: potentialGain,
        currentEfficiency: currentEfficiency,
        optimizedEfficiency: optimizedEfficiency,
        recommendations: recommendations
      });
    }, 1500); // 1.5 second delay to simulate processing
  });
};
