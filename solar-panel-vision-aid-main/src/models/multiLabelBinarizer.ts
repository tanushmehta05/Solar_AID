
import { YOLO_CLASSES } from './config';

/**
 * MultiLabelBinarizer - Utility class for handling multi-label classification
 * Similar to scikit-learn's MultiLabelBinarizer, this converts between sets of labels
 * and binary label vectors.
 */
export class MultiLabelBinarizer {
  private classes: string[];
  
  constructor(classes: string[] = YOLO_CLASSES) {
    this.classes = [...classes]; // Make a copy to avoid reference issues
  }
  
  /**
   * Transform a list of label sets to a binary matrix
   * @param labelSets Array of label sets (each set can contain multiple labels)
   * @returns Binary matrix where each row corresponds to a label set
   */
  public fitTransform(labelSets: string[][]): number[][] {
    return labelSets.map(labelSet => this.transformSingle(labelSet));
  }
  
  /**
   * Transform a single label set to a binary vector
   * @param labelSet Set of labels
   * @returns Binary vector
   */
  private transformSingle(labelSet: string[]): number[] {
    return this.classes.map(className => 
      labelSet.includes(className) ? 1 : 0
    );
  }
  
  /**
   * Transform raw confidence scores to binary vectors using a threshold
   * @param confidenceScores Array of confidence scores for each class
   * @param threshold Confidence threshold
   * @returns Binary vector
   */
  public transformScores(confidenceScores: number[], threshold: number = 0.5): number[] {
    return confidenceScores.map(score => score >= threshold ? 1 : 0);
  }
  
  /**
   * Transform binary vectors back to label sets
   * @param binaryMatrix Binary matrix where each row is a binary vector
   * @returns Array of label sets
   */
  public inverseTransform(binaryMatrix: number[][]): string[][] {
    return binaryMatrix.map(binaryVector => this.inverseTransformSingle(binaryVector));
  }
  
  /**
   * Transform a single binary vector back to a label set
   * @param binaryVector Binary vector
   * @returns Set of labels
   */
  private inverseTransformSingle(binaryVector: number[]): string[] {
    const labelSet: string[] = [];
    binaryVector.forEach((value, index) => {
      if (value === 1 && index < this.classes.length) {
        labelSet.push(this.classes[index]);
      }
    });
    return labelSet;
  }
  
  /**
   * Get all available classes
   * @returns Array of class names
   */
  public getClasses(): string[] {
    return [...this.classes];
  }
  
  /**
   * Convert top confidence scores to predicted classes
   * @param scores Array of confidence scores for each class
   * @param threshold Minimum confidence threshold 
   * @param maxLabels Maximum number of labels to return
   * @returns Array of predicted class names
   */
  public getTopClasses(
    scores: number[], 
    threshold: number = 0.3,
    maxLabels: number = 3
  ): string[] {
    // Create array of [class, score] pairs
    const classScores = this.classes.map((className, index) => ({
      class: className,
      score: scores[index] || 0
    }));
    
    // Sort by score (highest first) and filter by threshold
    const sortedFilteredScores = classScores
      .sort((a, b) => b.score - a.score)
      .filter(item => item.score >= threshold);
    
    // Take top N results
    return sortedFilteredScores
      .slice(0, maxLabels)
      .map(item => item.class);
  }
}

// Export default instance with YOLO classes
export default new MultiLabelBinarizer(YOLO_CLASSES);
