
import React from "react";
import { AlertCircle, Check, ShieldAlert, Droplet, Zap, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AnalysisResult as AnalysisResultType } from "@/services/modelService";

interface AnalysisResultProps {
  result: AnalysisResultType;
  imageUrl: string;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, imageUrl }) => {
  // Format energy loss for display
  const formattedEnergyLoss = result.energyLossPercentage.toFixed(1);
  
  // Determine damage severity level and color
  const getSeverityInfo = (percentage: number) => {
    if (percentage < 5) return { level: "Low", color: "text-solar-success" };
    if (percentage < 15) return { level: "Moderate", color: "text-solar-warning" };
    return { level: "High", color: "text-solar-danger" };
  };
  
  const severityInfo = getSeverityInfo(result.energyLossPercentage);
  
  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-2">
        {result.hasDamage ? (
          <AlertCircle className="h-5 w-5 text-solar-danger" />
        ) : (
          <Check className="h-5 w-5 text-solar-success" />
        )}
        <h2 className="text-2xl font-semibold">
          {result.hasDamage 
            ? `Solar Panel Damage Detected: ${result.damageType}` 
            : "No Damage Detected"}
        </h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="relative border rounded-lg overflow-hidden">
            <img src={imageUrl} alt="Analyzed solar panel" className="w-full h-auto" />
            
            {/* Render bounding boxes if available */}
            {result.boundingBoxes && result.boundingBoxes.map((box, index) => (
              <div
                key={index}
                className="absolute border-2 border-solar-danger"
                style={{
                  left: `${box.x * 100}%`,
                  top: `${box.y * 100}%`,
                  width: `${box.width * 100}%`,
                  height: `${box.height * 100}%`
                }}
              >
                <div className="absolute -top-6 -left-1 bg-solar-danger text-white text-xs px-2 py-1 rounded">
                  {result.damageType} ({(box.confidence * 100).toFixed(0)}%)
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Detection Confidence</span>
              <span className="text-sm font-medium">{(result.confidence * 100).toFixed(0)}%</span>
            </div>
            <Progress value={result.confidence * 100} className="h-2" />
          </div>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Energy Impact Assessment</CardTitle>
              <CardDescription>Estimated impact on solar panel performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Damage Severity</span>
                  </div>
                  <span className={`font-medium ${severityInfo.color}`}>
                    {severityInfo.level}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Energy Loss</span>
                  </div>
                  <span className="font-medium">
                    {formattedEnergyLoss}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Current Efficiency</span>
                  </div>
                  <span className="font-medium">
                    {(100 - result.energyLossPercentage).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recommendations</CardTitle>
              <CardDescription>Steps to improve panel performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex gap-2">
                    <ArrowUpRight className="h-5 w-5 text-solar-blue shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
              
              <Button className="w-full mt-4 gradient-energy text-white">
                Get Detailed Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
