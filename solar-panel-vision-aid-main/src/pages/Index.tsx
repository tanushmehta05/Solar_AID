
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ImageUpload from "@/components/ImageUpload";
import ProcessingPipeline from "@/components/ProcessingPipeline";
import AnalysisResult from "@/components/AnalysisResult";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  SunIcon, 
  Lightbulb, 
  AlertCircle, 
  ArrowDown, 
  Battery, 
  BarChart, 
  Zap, 
  PanelTop 
} from "lucide-react";
import { analyzeImage, AnalysisResult as AnalysisResultType } from "@/services/modelService";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'yolo' | 'rf' | 'analysis' | 'complete'>('upload');
  const [result, setResult] = useState<AnalysisResultType | null>(null);

  // Cleanup URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleImageSelected = (file: File) => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    
    setSelectedImage(file);
    setImageUrl(URL.createObjectURL(file));
    setResult(null);
    setCurrentStep('upload');
  };

  const handleStartAnalysis = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    
    try {
      setCurrentStep('yolo');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setCurrentStep('rf');
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setCurrentStep('analysis');
      const analysisResult = await analyzeImage(selectedImage);
      
      setCurrentStep('complete');
      setResult(analysisResult);
      
      toast({
        title: "Analysis Complete",
        description: analysisResult.hasDamage 
          ? "Damage detected on solar panel" 
          : "No issues detected on solar panel",
        variant: analysisResult.hasDamage ? "destructive" : "default",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "There was an error analyzing the image."
      });
      setCurrentStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const scrollToAnalyzer = () => {
    const element = document.getElementById('panel-analyzer');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative w-full h-[85vh] flex items-center bg-gradient-to-r from-blue-900 to-blue-700 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('/images/solar-pattern.svg')] bg-repeat z-0" />
        <div className="container mx-auto z-10 px-4">
          <div className="max-w-3xl text-white space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tighter">
              Revolutionizing Solar Panel <span className="text-solar-yellow">Maintenance</span> with AI
            </h1>
            <p className="text-xl opacity-90">
              Detect damage, optimize performance, and maximize your energy production with our cutting-edge AI technology
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="gradient-solar text-white" onClick={scrollToAnalyzer}>
                Analyze Your Panel
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10" asChild>
                <Link to="/marketplace">Visit Marketplace</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Discover More</span>
            <ArrowDown className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Powerful AI Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced AI technology provides comprehensive analysis and optimization for your solar panels
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard 
              icon={<PanelTop className="h-10 w-10 text-solar-blue" />}
              title="Damage Detection"
              description="Detect cracks, dirt, bird droppings, and other damages that affect performance"
            />
            <FeatureCard 
              icon={<BarChart className="h-10 w-10 text-solar-orange" />}
              title="Performance Analysis"
              description="Get detailed insights on energy loss and efficiency impacts from panel conditions"
            />
            <FeatureCard 
              icon={<Zap className="h-10 w-10 text-solar-yellow" />}
              title="Optimization"
              description="Receive tailored recommendations to maximize your energy production"
            />
            <FeatureCard 
              icon={<Battery className="h-10 w-10 text-green-500" />}
              title="Energy Forecasting"
              description="Predict future energy production based on current panel conditions"
            />
            <FeatureCard 
              icon={<AlertCircle className="h-10 w-10 text-red-500" />}
              title="Early Warning"
              description="Identify potential issues before they cause significant energy loss"
            />
            <FeatureCard 
              icon={<Lightbulb className="h-10 w-10 text-yellow-400" />}
              title="Maintenance Tips"
              description="Get expert recommendations for maintenance and cleaning schedules"
            />
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our simple 3-step process makes solar panel maintenance easier than ever
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard 
              number="01"
              title="Upload Your Panel Image"
              description="Take a photo of your solar panel and upload it to our platform"
            />
            <StepCard 
              number="02"
              title="AI Analysis"
              description="Our YOLO+RF model analyzes the image to detect damage and performance issues"
            />
            <StepCard 
              number="03"
              title="Get Recommendations"
              description="Receive detailed reports and optimization recommendations"
            />
          </div>
        </div>
      </div>

      {/* Analyzer Tool Section */}
      <div id="panel-analyzer" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Analyze Your Solar Panel</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Upload an image of your panel for instant AI analysis and recommendations
            </p>
          </div>

          <Card className="border shadow-lg max-w-5xl mx-auto">
            <Tabs defaultValue="analyzer" className="w-full">
              <CardHeader>
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <CardTitle>Solar Panel Analysis Tool</CardTitle>
                  <TabsList>
                    <TabsTrigger value="analyzer">Analyzer</TabsTrigger>
                    <TabsTrigger value="results">Sample Results</TabsTrigger>
                  </TabsList>
                </div>
                <CardDescription>
                  Upload an image of your solar panel to detect damage and get optimization recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TabsContent value="analyzer" className="space-y-6">
                  <ProcessingPipeline currentStep={currentStep} />
                  
                  <div className="grid gap-8">
                    {!result && (
                      <div className="max-w-lg mx-auto w-full">
                        <ImageUpload 
                          onImageSelected={handleImageSelected} 
                          isProcessing={isProcessing} 
                        />
                        
                        {selectedImage && !isProcessing && (
                          <Button 
                            className="w-full mt-4 gradient-solar text-white"
                            onClick={handleStartAnalysis}
                          >
                            Start Analysis
                          </Button>
                        )}
                        
                        {isProcessing && (
                          <div className="flex justify-center mt-4">
                            <Button disabled className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing...
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {result && imageUrl && (
                      <AnalysisResult result={result} imageUrl={imageUrl} />
                    )}
                    
                    {result && (
                      <div className="flex justify-center">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSelectedImage(null);
                            setImageUrl(null);
                            setResult(null);
                            setCurrentStep('upload');
                          }}
                        >
                          Analyze Another Panel
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="results">
                  <div className="grid gap-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Physical Damage Detection</h3>
                        <img 
                          src="/images/sample-physical-damage.jpg" 
                          alt="Sample physical damage detection" 
                          className="w-full rounded-lg border"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Dirt & Dust Analysis</h3>
                        <img 
                          src="/images/sample-dust-analysis.jpg" 
                          alt="Sample dust analysis" 
                          className="w-full rounded-lg border"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        These are sample analysis results. Upload your own panel image to get personalized recommendations.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-solar-blue to-solar-lightBlue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Optimize Your Solar Investment?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of solar panel owners who are maximizing their energy production with our AI technology
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-solar-blue hover:bg-gray-100" asChild>
              <Link to="/marketplace">Explore Marketplace</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link to="/chat">Chat with Assistant</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string 
}) => {
  return (
    <Card className="border hover:shadow-md transition-all">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
};

// Step Card Component
const StepCard = ({ number, title, description }: { 
  number: string, 
  title: string, 
  description: string 
}) => {
  return (
    <div className="text-center p-6 relative">
      <div className="text-6xl font-bold text-gray-100 absolute top-0 left-1/2 transform -translate-x-1/2 -z-10">
        {number}
      </div>
      <div className="pt-10">
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

export default Index;
