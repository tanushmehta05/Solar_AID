import React, { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import ImageUpload from "@/components/ImageUpload";
import ProcessingPipeline from "@/components/ProcessingPipeline";
import AnalysisResult from "@/components/AnalysisResult";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  ZapIcon
} from "lucide-react";
import { analyzeImage, AnalysisResult as AnalysisResultType } from "@/services/modelService";
import { toast } from "@/components/ui/use-toast";
import { GEMINI_API_KEY } from '@/config/api-keys';
import { sendChatMessage } from '@/services/chatService';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Analysis = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'yolo' | 'rf' | 'analysis' | 'complete'>('upload');
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [isGeminiActive, setIsGeminiActive] = useState(false);
  const [startScreen, setStartScreen] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
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
    setStartScreen(false);
  };

  const handleStartAnalysis = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    setIsGeminiActive(false);
    
    try {
      setCurrentStep('yolo');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setCurrentStep('rf');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentStep('analysis');
      try {
        const analysisResult = await analyzeImage(selectedImage);
        setCurrentStep('complete');
        setResult(analysisResult);
        
        if (user) {
          let storedImageUrl = null;
          if (selectedImage) {
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('panel_images')
              .upload(`analysis/${user.id}/${Date.now()}_${selectedImage.name}`, selectedImage);
              
            if (!uploadError && uploadData) {
              storedImageUrl = supabase.storage.from('panel_images').getPublicUrl(uploadData.path).data.publicUrl;
            }
          }
          
          await supabase.from('analysis_history').insert({
            user_id: user.id,
            image_url: storedImageUrl,
            damage_type: analysisResult.damageType,
            confidence: analysisResult.confidence,
            energy_loss_percentage: analysisResult.energyLossPercentage,
            suggestions: analysisResult.suggestions,
            used_model: true
          });
        }
        
        toast({
          title: "Analysis Complete (YOLO Only)",
          description: analysisResult.hasDamage 
            ? "Damage detected on solar panel" 
            : "No issues detected on solar panel",
          variant: analysisResult.hasDamage ? "destructive" : "default",
        });
      } catch (error) {
        console.error("YOLO Model failed, falling back to Gemini API", error);
        
        if (GEMINI_API_KEY) {
          setIsGeminiActive(true);
          toast({
            title: "Switching to Gemini AI",
            description: "Our YOLO model is currently unavailable. Using Gemini API for analysis.",
          });
          
          const reader = new FileReader();
          reader.readAsDataURL(selectedImage);
          reader.onloadend = async () => {
            try {
              const base64Image = reader.result as string;
              const prompt = `Analyze this solar panel image in detail. Identify any visible damage (cracks, dirt, bird droppings, snow, electrical issues) and estimate energy loss. Format response as JSON with these fields: hasDamage (boolean), damageType (string), confidence (number 0-1), energyLossPercentage (number), suggestions (array of strings).`;
              
              const geminiResponse = await sendChatMessage(prompt, []);
              
              try {
                const parsedResponse = JSON.parse(geminiResponse);
                setResult(parsedResponse);
              } catch (parseError) {
                setResult({
                  hasDamage: geminiResponse.toLowerCase().includes("damage") || 
                            geminiResponse.toLowerCase().includes("crack") || 
                            geminiResponse.toLowerCase().includes("dirt"),
                  damageType: "Unknown (Gemini Analysis)",
                  confidence: 0.7,
                  energyLossPercentage: 10,
                  suggestions: [geminiResponse.split('.').filter(s => s.trim().length > 0).map(s => s.trim())[0]],
                });
              }
              
              if (user) {
                let storedImageUrl = null;
                if (selectedImage) {
                  const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('panel_images')
                    .upload(`analysis/${user.id}/${Date.now()}_${selectedImage.name}`, selectedImage);
                    
                  if (!uploadError && uploadData) {
                    storedImageUrl = supabase.storage.from('panel_images').getPublicUrl(uploadData.path).data.publicUrl;
                  }
                }
                
                if (result) {
                  await supabase.from('analysis_history').insert({
                    user_id: user.id,
                    image_url: storedImageUrl,
                    damage_type: result.damageType,
                    confidence: result.confidence,
                    energy_loss_percentage: result.energyLossPercentage,
                    suggestions: result.suggestions,
                    used_model: false
                  });
                }
              }
              
              setCurrentStep('complete');
            } catch (geminiError) {
              console.error("Gemini API failed:", geminiError);
              toast({
                variant: "destructive",
                title: "Analysis Failed",
                description: "Both YOLO model and Gemini API failed to analyze the image."
              });
              setCurrentStep('upload');
            }
          };
        } else {
          toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: "YOLO model failed and no Gemini API key is configured."
          });
          setCurrentStep('upload');
        }
      }
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

  const handleScroll = () => {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      const scrollPosition = rect.top;
      const viewportHeight = window.innerHeight;
      
      if (scrollPosition < viewportHeight / 2 && scrollPosition > 0) {
        const scale = 1 + ((viewportHeight / 2 - scrollPosition) / (viewportHeight * 2)) * 0.5;
        const opacity = Math.min(1, (viewportHeight / 2 - scrollPosition) / (viewportHeight / 4));
        
        panelRef.current.style.transform = `scale(${scale})`;
        panelRef.current.style.opacity = opacity.toString();
      } else if (scrollPosition > viewportHeight / 2) {
        panelRef.current.style.transform = 'scale(1)';
        panelRef.current.style.opacity = '0';
      } else {
        panelRef.current.style.transform = 'scale(1.5)';
        panelRef.current.style.opacity = '1';
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Layout>
      {startScreen && (
        <div className="fixed inset-0 bg-gradient-to-r from-blue-900 to-blue-700 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center z-50">
          <div className="text-center max-w-2xl px-4 animate-fade-in">
            <h1 className="text-5xl font-bold text-white mb-6">Solar Panel Analysis</h1>
            <p className="text-xl text-white/80 mb-10">
              Our AI-powered analysis tool helps you detect damage and optimize your solar panel performance
            </p>
            <Button 
              size="lg" 
              className="bg-white text-blue-800 hover:bg-white/90 transition-all duration-300 transform hover:scale-105"
              onClick={() => setStartScreen(false)}
            >
              Get Started
              <ZapIcon className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      <div className="min-h-screen">
        <div className={`relative w-full h-[85vh] flex items-center ${isGeminiActive ? 'bg-gradient-to-r from-green-800 to-green-600 dark:from-green-900 dark:to-green-700' : 'bg-gradient-to-r from-blue-900 to-blue-700 dark:from-gray-900 dark:to-blue-900'} overflow-hidden transition-colors duration-300`}>
          <div className="absolute inset-0 opacity-20 bg-[url('/images/solar-pattern.svg')] bg-repeat z-0" />
          <div className="container mx-auto z-10 px-4">
            <div className="max-w-3xl text-white space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tighter animate-fade-in">
                Solar Panel <span className="text-solar-yellow">Analysis</span> Tool
              </h1>
              <p className="text-xl opacity-90 animate-fade-in" style={{animationDelay: "0.1s"}}>
                Upload an image of your solar panel for instant AI analysis and damage detection
              </p>
              <div className="pt-6 animate-fade-in" style={{animationDelay: "0.2s"}}>
                <div ref={panelRef} className="relative max-w-md mx-auto transition-all duration-700 ease-out opacity-0">
                  <img 
                    src="/images/panel-mono.jpg" 
                    alt="Solar Panel" 
                    className="rounded-lg shadow-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 dark:text-white transition-colors duration-300">Solar Panel Analysis Tool</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
                Upload an image of your panel for instant AI analysis and recommendations using YOLO object detection
              </p>
            </div>

            <Card className={`border shadow-lg max-w-5xl mx-auto transition-colors duration-300 ${isGeminiActive ? 'dark:bg-green-900 dark:border-green-700 bg-green-50 border-green-200' : 'dark:bg-gray-800 dark:border-gray-700'}`}>
              <CardHeader>
                <CardTitle className="dark:text-white transition-colors duration-300">
                  {isGeminiActive ? (
                    <div className="flex items-center">
                      <span>Analysis Tool (Gemini AI)</span>
                      <div className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full">
                        Using Gemini AI
                      </div>
                    </div>
                  ) : (
                    "Analysis Tool (YOLO Model Only)"
                  )}
                </CardTitle>
                <CardDescription className="dark:text-gray-300 transition-colors duration-300">
                  Upload an image of your solar panel to detect damage and get optimization recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
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
                            className="w-full mt-4 gradient-solar text-white animate-pulse hover:animate-none"
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
                            setIsGeminiActive(false);
                          }}
                        >
                          Analyze Another Panel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analysis;
