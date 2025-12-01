import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("Used");
  const [efficiency, setEfficiency] = useState("Standard");
  const [age, setAge] = useState("");
  const [type, setType] = useState("Monocrystalline");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast({
        variant: "destructive",
        title: "Failed to fetch products",
        description: error.message,
      });
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload image to Supabase Storage
      let imageUrl = null;
      
      if (selectedImage) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('panel_images')
          .upload(`products/${Date.now()}_${selectedImage.name}`, selectedImage);
          
        if (uploadError) {
          throw uploadError;
        }
        
        imageUrl = supabase.storage.from('panel_images').getPublicUrl(uploadData.path).data.publicUrl;
      }
      
      // Make sure all required fields have values
      const productData = {
        title: title || "Untitled Product",
        price: Number(price) || 0,
        condition: condition || "Used",
        efficiency: efficiency || "Standard",
        age: Number(age) || 0,
        type: type || "Monocrystalline",
        image_url: imageUrl,
        seller_id: user?.id || ""
      };
      
      // Insert product into database
      const { data, error } = await supabase.from('products').insert(productData);
      
      if (error) throw error;
      
      toast({
        title: "Successfully listed product",
        description: "Your solar panel has been listed on the marketplace",
      });
      
      // Reset form
      setTitle("");
      setPrice("");
      setCondition("Used");
      setEfficiency("Standard");
      setAge("");
      setType("Monocrystalline");
      setSelectedImage(null);
      setPreviewUrl(null);
      
      // Refresh product list
      fetchProducts();
    } catch (error: any) {
      console.error("Error listing product:", error);
      toast({
        variant: "destructive",
        title: "Failed to list product",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-8">Solar Panel Marketplace</h1>

        {/* Product Listing Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>List a Solar Panel</CardTitle>
            <CardDescription>
              Provide details about the solar panel you want to sell.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Used">Used</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Refurbished">Refurbished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="efficiency">Efficiency</Label>
                <Select value={efficiency} onValueChange={setEfficiency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select efficiency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="age">Age (years)</Label>
                <Input
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="type">Panel Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select panel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monocrystalline">Monocrystalline</SelectItem>
                    <SelectItem value="Polycrystalline">Polycrystalline</SelectItem>
                    <SelectItem value="Thin Film">Thin Film</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="image">Image</Label>
                <Input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mt-2 rounded-md"
                    style={{ maxWidth: "200px" }}
                  />
                )}
              </div>
              <Button disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "List Product"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Product Listing Display */}
        <h2 className="text-2xl font-bold mb-4">Available Solar Panels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle>{product.title}</CardTitle>
                <CardDescription>
                  {product.condition} - {product.type}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="mb-4 rounded-md"
                    style={{ width: "100%", height: "200px", objectFit: "cover" }}
                  />
                )}
                <p className="mb-2">Price: ${product.price}</p>
                <p className="mb-2">Efficiency: {product.efficiency}</p>
                <p className="mb-2">Age: {product.age} years</p>
              </CardContent>
        
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Marketplace;
