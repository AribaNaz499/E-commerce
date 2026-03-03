import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from "../../supabase/client";
import UserNavbar from './UserNavbar';
import UserFooter from './UserFooter';

const CategoryPage = () => {
    const { categoryName } = useParams(); 
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryDesigns = async () => {
            setLoading(true);
            
            const formattedCategory = categoryName.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');

            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .ilike('category', `%${formattedCategory}%`); 

                if (error) throw error;
                setDesigns(data || []);
            } catch (err) {
                console.error("Supabase Fetch Error:", err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryDesigns();
    }, [categoryName]);

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <UserNavbar />
            
            <main className="flex-grow py-16 px-6 md:px-20">
                <header className="mb-12 text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 capitalize tracking-tight">
                        {categoryName.replace(/-/g, ' ')}
                    </h2>
                    <div className="h-1 w-20 bg-blue-600 mx-auto mt-4 rounded-full"></div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-500 font-medium">Loading amazing designs...</p>
                    </div>
                ) : designs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {designs.map((product) => (
                            <div 
                                key={product.id} 
                                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
                            >
                                <div className="aspect-[4/5] overflow-hidden bg-gray-50 relative">
                                    <img 
                                        src={product.image_url} 
                                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
                                        alt={product.name} 
                                    />
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                
                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-gray-900 truncate">
                                        {product.name || "Untitled Design"}
                                    </h3>
                                    <p className="text-sm text-blue-600 font-medium mt-1">
                                        {product.category}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="text-6xl mb-4">🎨</div>
                        <h3 className="text-xl font-bold text-gray-800">No designs found</h3>
                        <p className="text-gray-500 mt-2">
                            Humne "{categoryName.replace(/-/g, ' ')}" mein dhoonda, magar abhi koi product nahi mila.
                        </p>
                    </div>
                )}
            </main>

            <UserFooter />
        </div>
    );
};

export default CategoryPage;