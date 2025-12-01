
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Compass, LineChart, Check } from "lucide-react";
import { optimizePanelPosition, OptimizationParams, OptimizationResult } from "@/services/modelService";
import { toast } from "@/components/ui/use-toast";

const PanelOptimization: React.FC = () => {
  const [params, setParams] = useState<OptimizationParams>({
    latitude: 0,
    longitude: 0,
    damageLevel: 'None',
    dirtLevel: 'Clean'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  
  const handleChange = (name: keyof OptimizationParams, value: string | number) => {
    setParams(prev => ({ ...prev, [name]: value }));
  };
  
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setParams(prev => ({
            ...prev,
            latitude: parseFloat(position.coords.latitude.toFixed(6)),
            longitude: parseFloat(position.coords.longitude.toFixed(6))
          }));
          toast({
            title: "Location detected",
            description: "Your current coordinates have been set.",
          });
        },
        () => {
          toast({
            variant: "destructive",
            title: "Error detecting location",
            description: "Please enter coordinates manually."
          });
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation. Please enter coordinates manually."
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    // Validate inputs
    if (params.latitude < -90 || params.latitude > 90) {
      toast({
        variant: "destructive",
        title: "Invalid latitude",
        description: "Latitude must be between -90 and 90 degrees."
      });
      return;
    }
    
    if (params.longitude < -180 || params.longitude > 180) {
      toast({
        variant: "destructive",
        title: "Invalid longitude",
        description: "Longitude must be between -180 and 180 degrees."
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const optimizationResult = await optimizePanelPosition(params);
      setResult(optimizationResult);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Optimization failed",
        description: "There was an error optimizing panel position."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Solar Panel Optimization</CardTitle>
          <CardDescription>
            Optimize panel tilt and orientation based on your location and panel condition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <div className="flex space-x-2">
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={params.latitude}
                    onChange={(e) => handleChange('latitude', parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 37.7749"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={params.longitude}
                  onChange={(e) => handleChange('longitude', parseFloat(e.target.value) || 0)}
                  placeholder="e.g. -122.4194"
                />
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={handleGetLocation}
            >
              <Compass className="mr-2 h-4 w-4" />
              Use Current Location
            </Button>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="damage-level">Damage Level</Label>
                <Select 
                  value={params.damageLevel} 
                  onValueChange={(value) => handleChange('damageLevel', value as any)}
                >
                  <SelectTrigger id="damage-level">
                    <SelectValue placeholder="Select damage level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Light">Light</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dirt-level">Dirt Level</Label>
                <Select 
                  value={params.dirtLevel} 
                  onValueChange={(value) => handleChange('dirtLevel', value as any)}
                >
                  <SelectTrigger id="dirt-level">
                    <SelectValue placeholder="Select dirt level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Clean">Clean</SelectItem>
                    <SelectItem value="Light">Light</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Heavy">Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full gradient-solar text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Optimizing...
                </>
              ) : (
                "Optimize Panel Position"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Results</CardTitle>
            <CardDescription>
              Recommended settings for maximum energy production
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Optimal Tilt Angle</p>
                  <p className="text-2xl font-bold">{result.optimalTiltAngle.toFixed(1)}°</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Optimal Azimuth</p>
                  <p className="text-2xl font-bold">
                    {result.optimalAzimuth === 180 ? "South" : "North"} ({result.optimalAzimuth}°)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Current Efficiency</p>
                  <p className="text-2xl font-bold">{result.currentEfficiency.toFixed(1)}%</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">After Optimization</p>
                  <p className="text-2xl font-bold text-solar-success">
                    {result.optimizedEfficiency.toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Potential Energy Gain</span>
                  <span className="text-sm font-medium text-solar-success">
                    +{result.potentialEnergyGain.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-solar-yellow to-solar-orange rounded-full"
                    style={{ width: `${Math.min(100, result.potentialEnergyGain * 5)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium">Recommendations</p>
                <ul className="space-y-2">
                  {result.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex gap-2">
                      <Check className="h-5 w-5 text-solar-success shrink-0" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button className="w-full gradient-energy text-white">
                <LineChart className="mr-2 h-4 w-4" />
                Generate Detailed Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PanelOptimization;
