
import { YoloModel, YoloDetection } from './yoloModel';
import { RFModel, RFPrediction } from './rfModel';
import { AnalysisResult, DamageType } from '@/services/modelService';
import { YOLO_CLASSES } from './config';

export interface PipelineResult extends AnalysisResult {
  yoloDetections: YoloDetection[];
  rfPrediction: RFPrediction;
  processingTime: number;
  secondaryDamageTypes?: string[];
  classConfidences?: Record<string, number>;
}

export class SolarPanelAnalysisPipeline {
  private yoloModel: YoloModel;
  private rfModel: RFModel;
  
  constructor(yoloModelPath?: string, rfModelPath?: string) {
    this.yoloModel = new YoloModel(yoloModelPath);
    this.rfModel = new RFModel(rfModelPath);
  }
  
  /**
   * Initialize and load all models in the pipeline
   */
  async initialize(): Promise<void> {
    console.log('Initializing Solar Panel Analysis Pipeline...');
    
    // Load models in parallel
    await Promise.all([
      this.yoloModel.loadModel(),
      this.rfModel.loadModel()
    ]);
    
    console.log('Pipeline initialization complete.');
  }
  
  /**
   * Run the full pipeline on an image
   * @param image Image element or canvas
   * @returns Complete analysis result
   */
  async analyze(image: HTMLImageElement | HTMLCanvasElement): Promise<PipelineResult> {
    console.log('Starting solar panel analysis pipeline...');
    const startTime = performance.now();
    
    try {
      // Step 1: Run YOLO detection
      console.log('Step 1: Running YOLO detection');
      const yoloDetections = await this.yoloModel.detect(image);
      
      // Get image dimensions
      const imageWidth = image instanceof HTMLImageElement ? image.naturalWidth : image.width;
      const imageHeight = image instanceof HTMLImageElement ? image.naturalHeight : image.height;
      
      // Step 2: Use RF to classify and analyze the damage
      console.log('Step 2: Running RF classification and analysis');
      const rfPrediction = await this.rfModel.classify(yoloDetections, imageWidth, imageHeight);
      
      // Step 3: Generate suggestions based on analysis
      console.log('Step 3: Generating suggestions');
      const suggestions = this.generateSuggestions(rfPrediction.damageType, rfPrediction.energyLossPercentage, rfPrediction.secondaryDamageTypes);
      
      // Step 4: Format the result
      console.log('Step 4: Formatting final results');
      const boundingBoxes = yoloDetections.map(detection => ({
        x: detection.box.x,
        y: detection.box.y,
        width: detection.box.width,
        height: detection.box.height,
        confidence: detection.score
      }));
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      // Create final result
      const result: PipelineResult = {
        hasDamage: rfPrediction.damageType !== 'Clean',
        damageType: rfPrediction.damageType as DamageType,
        confidence: rfPrediction.confidence,
        energyLossPercentage: rfPrediction.energyLossPercentage,
        boundingBoxes: boundingBoxes.length > 0 ? boundingBoxes : undefined,
        secondaryDamageTypes: rfPrediction.secondaryDamageTypes,
        classConfidences: rfPrediction.allClassProbabilities,
        suggestions,
        yoloDetections,
        rfPrediction,
        processingTime
      };
      
      console.log('Pipeline complete. Total processing time:', processingTime.toFixed(2), 'ms');
      return result;
    } catch (error) {
      console.error('Pipeline error:', error);
      throw new Error(`Solar panel analysis pipeline failed: ${error}`);
    }
  }
  
  /**
   * Generate suggestions based on damage type and energy loss
   * @param damageType Type of damage detected
   * @param energyLoss Percentage of energy loss
   * @param secondaryDamageTypes Optional secondary damage types
   * @returns Array of suggestions
   */
  private generateSuggestions(
    damageType: string, 
    energyLoss: number,
    secondaryDamageTypes?: string[]
  ): string[] {
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
  }
  
  /**
   * Update model paths
   * @param yoloPath New path for YOLO model
   * @param rfPath New path for RF model
   */
  async updateModelPaths(yoloPath?: string, rfPath?: string): Promise<void> {
    const updatePromises = [];
    
    if (yoloPath) {
      console.log(`Updating YOLO model path to: ${yoloPath}`);
      updatePromises.push(this.yoloModel.updateModelPath(yoloPath));
    }
    
    if (rfPath) {
      console.log(`Updating RF model path to: ${rfPath}`);
      updatePromises.push(this.rfModel.updateModelPath(rfPath));
    }
    
    await Promise.all(updatePromises);
    console.log('Model paths updated successfully');
  }
}
