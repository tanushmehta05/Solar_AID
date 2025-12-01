
import React from "react";
import { 
  ArrowRight, 
  Image as ImageIcon, 
  Microscope, 
  Radar, 
  FileBarChart, 
  Zap 
} from "lucide-react";

interface ProcessingPipelineProps {
  currentStep: 'upload' | 'yolo' | 'rf' | 'analysis' | 'complete';
}

const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({ currentStep }) => {
  const steps = [
    { id: 'upload', label: 'Upload', icon: <ImageIcon className="h-5 w-5" /> },
    { id: 'yolo', label: 'Damage Detection', icon: <Microscope className="h-5 w-5" /> },
    { id: 'rf', label: 'Processing', icon: <Radar className="h-5 w-5" /> },
    { id: 'analysis', label: 'Analysis', icon: <FileBarChart className="h-5 w-5" /> },
    { id: 'complete', label: 'Results', icon: <Zap className="h-5 w-5" /> }
  ];

  // Determine active steps
  const getStepStatus = (stepId: string) => {
    const stepOrder = ['upload', 'yolo', 'rf', 'analysis', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="w-full py-4">
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div 
                  className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
                    status === 'completed' 
                      ? 'bg-solar-blue text-white' 
                      : status === 'current'
                        ? 'bg-solar-blue text-white animate-pulse-slow'
                        : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {step.icon}
                </div>
                <span className={`text-xs mt-1 ${
                  status === 'completed' || status === 'current'
                    ? 'font-medium'
                    : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <ArrowRight 
                  className={`h-4 w-4 mx-2 hidden md:block ${
                    getStepStatus(steps[index + 1].id) === 'upcoming' 
                      ? 'text-muted-foreground' 
                      : 'text-solar-blue'
                  }`} 
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessingPipeline;
