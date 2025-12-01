
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Eye, Trash2, ArrowUpDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  condition: string;
  seller_id: string;
  seller_email?: string;
  created_at: string;
}

interface Analysis {
  id: string;
  user_id: string;
  user_email?: string;
  damage_type: string;
  confidence: number;
  energy_loss_percentage: number;
  created_at: string;
  used_model: boolean;
}

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Fetch users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;
      
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (productsError) throw productsError;
      
      // Fetch analyses
      const { data: analysesData, error: analysesError } = await supabase
        .from('analysis_history')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (analysesError) throw analysesError;

      // Map user emails to products and analyses
      const productsWithSeller = await Promise.all(
        productsData.map(async (product) => {
          const { data } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', product.seller_id)
            .single();
          return {
            ...product,
            seller_email: data?.email || 'Unknown',
          };
        })
      );

      const analysesWithUser = await Promise.all(
        analysesData.map(async (analysis) => {
          const { data } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', analysis.user_id)
            .single();
          return {
            ...analysis,
            user_email: data?.email || 'Unknown',
          };
        })
      );
      
      setUsers(profilesData as User[]);
      setProducts(productsWithSeller as Product[]);
      setAnalyses(analysesWithUser as Analysis[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error fetching data",
        description: "There was an error loading the admin data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setProducts(products.filter(product => product.id !== id));
      
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        variant: "destructive",
        title: "Error deleting product",
        description: "There was an error deleting the product.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <AuthGuard requireAdmin>
      <Layout>
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-6 dark:text-white">Admin Dashboard</h1>
          
          <Tabs defaultValue="users">
            <TabsList className="mb-6">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="analyses">Analysis History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between dark:text-white">
                    <span>Users</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={fetchData}
                      className="dark:border-gray-600 dark:text-gray-300"
                    >
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="rounded-md border dark:border-gray-700">
                      <Table>
                        <TableHeader>
                          <TableRow className="dark:border-gray-700">
                            <TableHead className="dark:text-gray-300">Email</TableHead>
                            <TableHead className="dark:text-gray-300">Full Name</TableHead>
                            <TableHead className="dark:text-gray-300">Admin Status</TableHead>
                            <TableHead className="dark:text-gray-300">Joined</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-10 dark:text-gray-400">No users found</TableCell>
                            </TableRow>
                          ) : (
                            users.map((user) => (
                              <TableRow key={user.id} className="dark:border-gray-700">
                                <TableCell className="font-medium dark:text-white">{user.email}</TableCell>
                                <TableCell className="dark:text-gray-300">{user.full_name || 'N/A'}</TableCell>
                                <TableCell className="dark:text-gray-300">
                                  {user.is_admin ? (
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                      Admin
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                      User
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="dark:text-gray-300">{formatDate(user.created_at)}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="products">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between dark:text-white">
                    <span>Products</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={fetchData}
                      className="dark:border-gray-600 dark:text-gray-300"
                    >
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="rounded-md border dark:border-gray-700">
                      <Table>
                        <TableHeader>
                          <TableRow className="dark:border-gray-700">
                            <TableHead className="dark:text-gray-300">Title</TableHead>
                            <TableHead className="dark:text-gray-300">Price</TableHead>
                            <TableHead className="dark:text-gray-300">Condition</TableHead>
                            <TableHead className="dark:text-gray-300">Seller</TableHead>
                            <TableHead className="dark:text-gray-300">Listed</TableHead>
                            <TableHead className="dark:text-gray-300">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-10 dark:text-gray-400">No products found</TableCell>
                            </TableRow>
                          ) : (
                            products.map((product) => (
                              <TableRow key={product.id} className="dark:border-gray-700">
                                <TableCell className="font-medium dark:text-white">{product.title}</TableCell>
                                <TableCell className="dark:text-gray-300">${product.price}</TableCell>
                                <TableCell className="dark:text-gray-300">{product.condition}</TableCell>
                                <TableCell className="dark:text-gray-300">{product.seller_email}</TableCell>
                                <TableCell className="dark:text-gray-300">{formatDate(product.created_at)}</TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => navigate(`/marketplace?product=${product.id}`)}
                                      className="dark:border-gray-600 dark:text-gray-300"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      onClick={() => handleDeleteProduct(product.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analyses">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between dark:text-white">
                    <span>Analysis History</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={fetchData}
                      className="dark:border-gray-600 dark:text-gray-300"
                    >
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="rounded-md border dark:border-gray-700">
                      <Table>
                        <TableHeader>
                          <TableRow className="dark:border-gray-700">
                            <TableHead className="dark:text-gray-300">User</TableHead>
                            <TableHead className="dark:text-gray-300">Damage Type</TableHead>
                            <TableHead className="dark:text-gray-300">Confidence</TableHead>
                            <TableHead className="dark:text-gray-300">Energy Loss</TableHead>
                            <TableHead className="dark:text-gray-300">Model Used</TableHead>
                            <TableHead className="dark:text-gray-300">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analyses.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-10 dark:text-gray-400">No analysis records found</TableCell>
                            </TableRow>
                          ) : (
                            analyses.map((analysis) => (
                              <TableRow key={analysis.id} className="dark:border-gray-700">
                                <TableCell className="font-medium dark:text-white">{analysis.user_email}</TableCell>
                                <TableCell className="dark:text-gray-300">{analysis.damage_type}</TableCell>
                                <TableCell className="dark:text-gray-300">{analysis.confidence}%</TableCell>
                                <TableCell className="dark:text-gray-300">{analysis.energy_loss_percentage}%</TableCell>
                                <TableCell className="dark:text-gray-300">
                                  {analysis.used_model ? (
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                      ML Pipeline
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                      Gemini API
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="dark:text-gray-300">{formatDate(analysis.created_at)}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default Admin;
