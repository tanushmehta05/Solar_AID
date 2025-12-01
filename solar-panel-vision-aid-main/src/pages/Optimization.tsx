
import React from "react";
import Layout from "@/components/Layout";
import PanelOptimization from "@/components/PanelOptimization";
import { Compass, Sun, ArrowUpRight } from "lucide-react";

const Optimization = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Solar Panel <span className="text-solar-orange">Optimization</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Maximize energy production by finding the optimal tilt and orientation for your solar panels
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="w-12 h-12 rounded-full gradient-solar flex items-center justify-center mb-4">
              <Sun className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">NASA Data Powered</h3>
            <p className="text-muted-foreground">
              Our optimization uses NASA solar irradiance data for precise recommendations
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="w-12 h-12 rounded-full gradient-solar flex items-center justify-center mb-4">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Location Specific</h3>
            <p className="text-muted-foreground">
              Recommendations tailored to your exact geographical coordinates
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="w-12 h-12 rounded-full gradient-solar flex items-center justify-center mb-4">
              <ArrowUpRight className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Efficiency Boost</h3>
            <p className="text-muted-foreground">
              Increase energy production by up to 25% with optimized positioning
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border shadow-md">
          <div className="p-6 md:p-8">
            <PanelOptimization />
          </div>
        </div>
        
        <div className="bg-secondary/30 rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">How Panel Optimization Works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-solar-blue text-white flex items-center justify-center font-semibold">1</div>
              <h3 className="font-medium">Enter Location</h3>
              <p className="text-sm text-muted-foreground">
                Provide your latitude and longitude or use current location
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-solar-blue text-white flex items-center justify-center font-semibold">2</div>
              <h3 className="font-medium">Specify Panel Condition</h3>
              <p className="text-sm text-muted-foreground">
                Input damage and dirt levels to get accurate efficiency calculations
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-solar-blue text-white flex items-center justify-center font-semibold">3</div>
              <h3 className="font-medium">Get Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Receive optimal tilt and orientation angles with expected energy gains
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Optimization;
