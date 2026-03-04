import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "../../supabase/client";
import UserNavbar from './UserNavbar';
import UserFooter from './UserFooter';
import { Share, GitCompare, Heart } from 'lucide-react';

const CategoryPage = () => {
    const { categoryName } = useParams(); 
    const navigate = useNavigate();
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleEditPage = (id) => {
        navigate(`/design-editor/${id}`);
    };

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
                    <div className="h-1 w-20 bg-rose-600 mx-auto mt-2 rounded-full"></div>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-950"></div>
                    </div>
                ) : designs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {designs.map((product) => (
                            <div 
                                key={product.id} 
                                className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col"
                            >
                                <div className="aspect-[4/5] overflow-hidden bg-gray-50 relative">
                                    <img 
                                        src={product.image_url} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                        alt={product.name} 
                                    />
                                    
                                    <div className="hidden md:flex absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button className="bg-white text-yellow-600 font-bold px-8 py-3 rounded-full mb-4 transition-transform hover:bg-rose-100 active:scale-95">
                                            Add to cart
                                        </button>
                                        <button 
                                            onClick={() => handleEditPage(product.id)}
                                            className='bg-white text-yellow-600 font-bold px-8 py-3 rounded-full mb-4 transition-transform hover:bg-rose-100 active:scale-95'
                                        >
                                            Edit
                                        </button>
                                        <div className="flex items-center gap-4 text-white font-semibold text-sm">
                                            <button className="flex items-center gap-1 hover:text-yellow-500 transition-colors"><Share size={16} /> Share</button>
                                            <button className="flex items-center gap-1 hover:text-yellow-500 transition-colors"><GitCompare size={16} /> Compare</button>
                                            <button className="flex items-center gap-1 hover:text-yellow-500 transition-colors"><Heart size={16} /> Like</button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 truncate max-w-[150px] sm:max-w-full">
                                                {product.name || "Untitled Design"}
                                            </h3>
                                            <p className="text-sm text-rose-600 font-medium mt-1">
                                                {product.category}
                                            </p>
                                        </div>
                                        <button className="md:hidden text-gray-400 hover:text-rose-600">
                                            <Heart size={20} />
                                        </button>
                                    </div>

                                    <div className="mt-4 flex flex-col gap-2 md:hidden">
                                        <button className="w-full bg-rose-950 text-white text-sm font-bold py-2.5 rounded-xl active:scale-95">
                                            Add to Cart
                                        </button>
                                        <button 
                                            onClick={() => handleEditPage(product.id)}
                                            className="w-full border border-gray-200 text-gray-700 text-sm font-bold py-2.5 rounded-xl active:scale-95"
                                        >
                                            Edit Design
                                        </button>
                                        
                                        <div className="flex justify-between mt-1 px-1">
                                            <button className="flex items-center gap-1 text-xs text-gray-500"><Share size={14} /> Share</button>
                                            <button className="flex items-center gap-1 text-xs text-gray-500"><GitCompare size={14} /> Compare</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="text-6xl mb-4">🎨</div>
                        <h3 className="text-xl font-bold text-gray-800">No designs found</h3>
                        <p className="text-gray-500 mt-2">
                            We are trying to find the "{categoryName.replace(/-/g, ' ')}" designs.
                        </p>
                    </div>
                )}
            </main>

            <UserFooter />
        </div>
    );
};

export default CategoryPage;