
import { MODEL_PATHS, MODEL_SETTINGS, YOLO_CLASSES, MULTI_LABEL_CONFIG } from './config';
import { MultiLabelBinarizer } from './multiLabelBinarizer';
import * as ort from 'onnxruntime-web';

export interface YoloDetection {
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  class: string;
  score: number;
  secondaryClasses?: string[]; // For multi-label classification
  allScores?: Record<string, number>; // All class scores
}

export class YoloModel {
  private modelPath: string;
  private settings: typeof MODEL_SETTINGS.YOLO;
  private model: ort.InferenceSession | null = null;
  private isLoaded: boolean = false;
  private multiLabelBinarizer: MultiLabelBinarizer;

  constructor(customModelPath?: string) {
    // Use the Hugging Face model URL by default
    this.modelPath = customModelPath || 'https://huggingface.co/Mehhta/yolo_solar_classify/resolve/main/best.onnx';
    this.settings = MODEL_SETTINGS.YOLO;
    this.multiLabelBinarizer = new MultiLabelBinarizer(YOLO_CLASSES);
  }

  /**
   * Loads the YOLO model
   */
  async loadModel(): Promise<void> {
    if (this.isLoaded) return;
    
    try {
      console.log(`Loading YOLO model from: ${this.modelPath}`);
      
      // Set ONNX runtime options
      const options = {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all'
      };
      
      // Now we're just mocking the model loading
      // In a real implementation, you would:
      // this.model = await ort.InferenceSession.create(this.modelPath, options);
      
      // For now, we'll simulate successful loading
      console.log('Successfully loaded mock YOLO model');
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load YOLO model:', error);
      throw new Error(`Failed to load YOLO model: ${error}`);
    }
  }

  /**
   * Process raw model output to get detections with multi-label support
   * @param modelOutput Raw output from the YOLO model
   * @returns Processed YoloDetection objects
   */
  private processModelOutput(modelOutput: any): YoloDetection[] {
    // This is a placeholder for the actual processing logic
    // In a real implementation, you would:
    // 1. Extract bounding boxes, class scores, etc. from model output
    // 2. Apply NMS (Non-Maximum Suppression)
    // 3. Convert coordinates to the right format
    // 4. Process multi-label classifications if enabled
    
    console.log('Processing mock YOLO model output');
    
    // Mock detections for development
    const mockDetections: YoloDetection[] = [
      {
        box: { x: 0.2, y: 0.3, width: 0.4, height: 0.25 },
        class: 'Physical-damage',
        score: 0.85,
        secondaryClasses: ['Dusty'],
        allScores: {
          'Bird-drop': 0.05,
          'Dusty': 0.45,
          'Clean': 0.02,
          'Electrical-damage': 0.12,
          'Physical-damage': 0.85,
          'Snow': 0.01
        }
      },
      {
        box: { x: 0.6, y: 0.5, width: 0.2, height: 0.15 },
        class: 'Dusty',
        score: 0.72,
        secondaryClasses: [],
        allScores: {
          'Bird-drop': 0.10,
          'Dusty': 0.72,
          'Clean': 0.15,
          'Electrical-damage': 0.03,
          'Physical-damage': 0.08,
          'Snow': 0.02
        }
      }
    ];
    
    return mockDetections;
  }

  /**
   * Add multi-label classification to detections
   * @param detections Single-label detections to process
   * @returns Detections with multi-label information
   */
  private addMultiLabelInfo(detections: YoloDetection[]): YoloDetection[] {
    if (!MULTI_LABEL_CONFIG.enableMultiLabel) {
      return detections;
    }
    
    return detections.map(detection => {
      // If we already have all scores, use them
      if (detection.allScores) {
        // Convert scores object to array in the correct order
        const scoresArray = YOLO_CLASSES.map(cls => detection.allScores?.[cls] || 0);
        
        // Get top classes excluding the primary class
        const allClasses = this.multiLabelBinarizer.getTopClasses(
          scoresArray,
          MULTI_LABEL_CONFIG.multiLabelThreshold,
          MULTI_LABEL_CONFIG.maxLabelsPerImage
        );
        
        // Filter out the primary class for secondary classes
        const secondaryClasses = allClasses.filter(cls => cls !== detection.class);
        
        return {
          ...detection,
          secondaryClasses
        };
      }
      
      return detection;
    });
  }

  /**
   * Detect objects in an image using YOLO
   * @param imageData The image data (can be HTML canvas, image element, or tensor)
   * @returns Array of detections
   */
  async detect(imageData: HTMLImageElement | HTMLCanvasElement): Promise<YoloDetection[]> {
    if (!this.isLoaded) {
      await this.loadModel();
    }
    
    try {
      console.log('Running YOLO object detection');
      
      // PLACEHOLDER: This is where you'd process the image through your YOLO model
      // The actual implementation will depend on your model format and runtime
      
      // For now, we'll use mock data to simulate detection
      console.log('Using mock detection data (since we are not actually running inference)');
      
      // Process raw model output
      let detections = this.processModelOutput(null);
      
      // Add multi-label information if enabled
      detections = this.addMultiLabelInfo(detections);
      
      return detections;
    } catch (error) {
      console.error('YOLO detection failed:', error);
      throw new Error(`YOLO detection failed: ${error}`);
    }
  }

  /**
   * Get the current model path
   */
  getModelPath(): string {
    return this.modelPath;
  }

  /**
   * Update the model path and reload the model
   */
  async updateModelPath(newPath: string): Promise<void> {
    this.modelPath = newPath;
    this.isLoaded = false;
    await this.loadModel();
  }
}
