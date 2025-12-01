
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Product {
  id: string;
  title: string;
  price: number;
  condition: string;
  efficiency: string;
  image_url?: string;
  seller_id: string;
  age: number;
  type: string;
}

interface ProductCardProps {
  product: Product;
  fetchProducts: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, fetchProducts }) => {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [deleting, setDeleting] = useState(false);
  
  const handleAddToCart = () => {
    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    });
  };
  
  const handleDelete = async () => {
    if (!user) return;
    
    setDeleting(true);
    try {
      // Check if user owns the product or is an admin
      if (user.id === product.seller_id || isAdmin) {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', product.id);
          
        if (error) throw error;
        
        toast({
          title: "Product deleted",
          description: "The product has been successfully removed from the marketplace.",
        });
        
        // Refresh products list
        fetchProducts();
      } else {
        toast({
          variant: "destructive",
          title: "Permission denied",
          description: "You can only delete your own listings.",
        });
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        variant: "destructive",
        title: "Error deleting product",
        description: error.message || "There was an error deleting the product.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const canDelete = user && (user.id === product.seller_id || isAdmin);

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-md dark:bg-gray-800 dark:border-gray-700 hover:scale-[1.02] duration-300">
      <div className="relative h-48">
        <img 
          src={product.image_url || "/images/panel-mono.jpg"} 
          alt={product.title} 
          className="w-full h-full object-cover"
        />
        <Badge className="absolute top-2 right-2">
          {product.condition}
        </Badge>
      </div>
      <CardContent className="pt-4 flex-grow">
        <h3 className="font-medium line-clamp-2 h-12 dark:text-white">{product.title}</h3>
        
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-sm dark:text-gray-300">
            <span className="text-muted-foreground dark:text-gray-400">Efficiency:</span>
            <span>{product.efficiency}</span>
          </div>
          <div className="flex items-center justify-between text-sm dark:text-gray-300">
            <span className="text-muted-foreground dark:text-gray-400">Age:</span>
            <span>{product.age} years</span>
          </div>
          <div className="flex items-center justify-between text-sm dark:text-gray-300">
            <span className="text-muted-foreground dark:text-gray-400">Type:</span>
            <span>{product.type}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex items-center justify-between border-t mt-4 dark:border-gray-700">
        <p className="font-bold dark:text-white">${product.price}</p>
        <div className="flex space-x-2">
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="px-2"
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="dark:text-white">Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription className="dark:text-gray-400">
                    Are you sure you want to delete this listing? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button size="sm" onClick={handleAddToCart} className="dark:bg-blue-600 dark:hover:bg-blue-700">
            <ShoppingCart className="h-4 w-4 mr-2" /> Add
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
