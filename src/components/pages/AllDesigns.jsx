import React, { useState, useEffect } from 'react'
import { Share, GitCompare, Heart, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/pages/UserNavbar';
import UserFooter from '../../components/pages/UserFooter';
import { supabase } from "../../supabase/client";

const AllDesigns = () => {
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchAllDesigns = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { descending: false });

            if (error) throw error;
            setDesigns(data || []);
        } catch (err) {
            console.error("Fetch Error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllDesigns();
    }, []);

      const handleEditPage = (id) => {
       navigate(`/design-editor/${id}`)
    };

    return (
        <>
            <UserNavbar />

            <div className="bg-rose-50/30 py-12 px-6 md:px-20 min-h-screen">
        
                <div className="max-w-7xl mx-auto mb-12">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-rose-950 font-semibold mb-4 hover:underline transition-all"
                    >
                        <ChevronLeft size={20} /> Back to Home
                    </button>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">All Our Creations</h2>
                    <p className="mt-2 text-gray-500 text-center max-w-2xl mx-auto">
                        Explore our complete collection of professional designs and templates.
                    </p>
                </div>


                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-950"></div>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                        {designs.map((product) => (
                            <div
                                key={product.id}
                                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100"
                            >
                                <div className="relative overflow-hidden aspect-square">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />

                
                                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button className="bg-white text-yellow-600 font-bold px-8 py-3 rounded-full mb-6 transition-transform hover:bg-rose-100 active:scale-95">
                                            Add to cart
                                        </button>
                                        <button onClick={() => handleEditPage(product.id)}
                                            className='bg-white text-yellow-600 font-bold px-8 py-3 rounded-full mb-6 transition-transform hover:bg-rose-100 active:scale-95'>Edit</button>
                                        <div className="flex items-center gap-4 text-white font-semibold text-sm">
                                            <button className="flex items-center gap-1 hover:text-yellow-500 transition-colors"><Share size={16} /> Share</button>
                                            <button className="flex items-center gap-1 hover:text-yellow-500 transition-colors"><GitCompare size={16} /> Compare</button>
                                            <button className="flex items-center gap-1 hover:text-yellow-500 transition-colors"><Heart size={16} /> Like</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 text-left">
                                    <p className="font-bold text-lg text-gray-800">{product.name}</p>
                                    <span className="inline-block mt-3 bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        {product.category || "General"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                
                {!loading && designs.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-xl">No designs found.</p>
                    </div>
                )}
            </div>

            <hr className='text-gray-200 mb-8 mx-6 md:mx-12 lg:mx-24' />
            <UserFooter />
        </>
    )
}

export default AllDesigns;