import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import BackgroundImg from '../../assets/images/bg.jpg';
import PosterImg from '../../assets/images/poster.jpg';
import Logos from '../../assets/images/logos.jpg';
import SocialMedia from '../../assets/images/socialMedia.jpg';
import KidsDesign from '../../assets/images/kids.jpg';
import { useCart } from '../../context/CartContext';
import { Heart, Share, GitCompare, ChevronDown, X, Star, Flame } from 'lucide-react';
import UserNavbar from './UserNavbar';
import UserFooter from './UserFooter';
import { supabase } from "../../config/supabaseClient";

const UserHome = () => {
    const [templates, setTemplates] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCodes, setActiveCodes] = useState([]);
    const [showPromoModal, setShowPromoModal] = useState(false);
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { descending: false })
                .limit(8);
            if (error) throw error;
            setTemplates(data || []);
        } catch (err) {
            console.error("Fetch Error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchFeaturedProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('featured', true)
                .order('created_at', { descending: true });
            
            if (error) throw error;
            setFeaturedProducts(data || []);
        } catch (err) {
            console.error("Fetch Featured Error:", err.message);
        }
    };

    const fetchActiveCodes = async () => {
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase
            .from('promo_codes')
            .select('code, discount_percent, usage_limit, used_count')
            .eq('is_active', true)
            .or(`expiry_date.gte.${today},expiry_date.is.null`);

        const available = (data || []).filter(c =>
            c.usage_limit === null || c.used_count < c.usage_limit
        );

        setActiveCodes(available);

        if (available.length > 0) {
            setTimeout(() => setShowPromoModal(true), 1000);
        }
    };

    useEffect(() => {
        fetchTemplates();
        fetchFeaturedProducts();
        fetchActiveCodes();
    }, []);

    const handleShowMore = () => navigate('/all-designs');
    const handleEditPage = (id) => navigate(`/design-editor/${id}`);
    const handleCategoryClick = (title) => {
        const slug = title.replace(/\s+/g, '-').toLowerCase();
        navigate(`/category/${slug}`);
    };

    return (
        <>
            <UserNavbar />

            {showPromoModal && activeCodes.length > 0 && (
                <div
                    className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setShowPromoModal(false)}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-rose-950 p-8 text-center relative">
                            <button
                                onClick={() => setShowPromoModal(false)}
                                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="text-5xl mb-3">🎉</div>
                            <h2 className="text-2xl font-black text-white">Special Offer!</h2>
                            <p className="text-rose-200 text-sm mt-1">Use these codes at checkout</p>
                        </div>

                        <div className="p-6 flex flex-col gap-4">
                            {activeCodes.map((c, i) => (
                                <div key={i} className="border-2 border-dashed border-rose-200 rounded-2xl p-4 text-center bg-rose-50">
                                    <p className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-widest">Promo Code</p>
                                    <p className="text-3xl font-black text-rose-950 tracking-widest font-mono">{c.code}</p>
                                    <p className="text-rose-600 font-bold mt-1">{c.discount_percent}% OFF</p>
                                    {c.usage_limit && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            {c.usage_limit - c.used_count} uses remaining
                                        </p>
                                    )}
                                </div>
                            ))}

                            <button
                                onClick={() => setShowPromoModal(false)}
                                className="w-full bg-rose-950 text-white py-3 rounded-xl font-bold hover:bg-rose-900 transition-all"
                            >
                                Shop Now
                            </button>
                            <button
                                onClick={() => setShowPromoModal(false)}
                                className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors"
                            >
                                No thanks
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div
                className="w-full min-h-[450px] md:h-[600px] bg-cover bg-center flex items-center justify-center md:justify-end px-6 md:px-24"
                style={{ backgroundImage: `url(${BackgroundImg})` }}
            >
                <div className="bg-rose-50/95 p-8 md:p-12 rounded-2xl shadow-xl max-w-lg w-full md:w-auto">
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 font-semibold">New Creations</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-rose-950 leading-tight mb-4">
                        Discover Our <br className="hidden md:block" /> New Designs
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 mb-6">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.
                    </p>
                    <button
                        onClick={handleShowMore}
                        className="w-full md:w-auto bg-rose-950 hover:bg-rose-900 text-white px-8 py-3 rounded-md font-medium transition-all transform active:scale-95">
                        Buy Now
                    </button>
                </div>
            </div>

          

            <div className="mt-16 text-center px-6">
                <h3 className="font-bold text-2xl md:text-3xl text-gray-800">Browse The Category</h3>
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:px-12 lg:px-20">
                    {[
                        { img: Logos, title: "Logos" },
                        { img: KidsDesign, title: "Kids Design" },
                        { img: SocialMedia, title: "Social Media" },
                        { img: PosterImg, title: "Posters" }
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="group cursor-pointer"
                            onClick={() => handleCategoryClick(item.title)}
                        >
                            <div className="overflow-hidden rounded-2xl shadow-md aspect-[3/4]">
                                <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                            </div>
                            <p className="mt-4 font-bold text-lg text-gray-700 group-hover:text-rose-950 transition-colors">
                                {item.title}
                            </p>
                        </div>
                    ))}
                </div>
            </div>


            {!loading && featuredProducts.length > 0 && (
                <div className="mt-20 text-center px-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Flame className="text-orange-500" size={28} />
                        <h3 className="font-bold text-2xl md:text-3xl text-gray-800">Trending & Best Sellers</h3>
                        <Star className="text-yellow-500" size={28} />
                    </div>
                    <p className="text-gray-500 text-sm mb-8">Most popular cards and gifts loved by our customers</p>

                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:px-12 lg:px-20">
                        {featuredProducts.slice(0, 8).map((product) => (
                            <div key={product.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-rose-100 flex flex-col">
                                <div className="absolute top-3 left-3 z-10 flex gap-2">
                                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                        <Flame size={10} /> HOT
                                    </span>
                                </div>
                                
                                <div className="relative overflow-hidden aspect-square">
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                                    <div className="hidden md:flex absolute inset-0 bg-black/50 flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button
                                            onClick={() => addToCart({
                                                id: product.id,
                                                name: product.name,
                                                price: product.price,
                                                quantity: 1,
                                                image: product.image_url,
                                                userDesign1: product.image_url,
                                                userDesign2: '',
                                                userDesign3: '',
                                                userDesign4: '',
                                                isEdited: false,
                                            })}
                                            className="bg-white text-rose-950 font-bold px-8 py-3 rounded-full mb-4 hover:bg-rose-50 transition-colors"
                                        >
                                            Add to cart
                                        </button>
                                        <button onClick={() => handleEditPage(product.id)} className='bg-white text-rose-950 font-bold px-8 py-3 rounded-full mb-4 transition-transform hover:bg-rose-50 active:scale-95'>Edit</button>
                                        <div className="flex items-center gap-4 text-white font-semibold text-sm">
                                            <button className="flex items-center gap-1 hover:text-yellow-500"><Share size={16} /> Share</button>
                                            <button className="flex items-center gap-1 hover:text-yellow-500"><GitCompare size={16} /> Compare</button>
                                            <button className="flex items-center gap-1 hover:text-yellow-500"><Heart size={16} /> Like</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 md:p-5 text-left flex flex-col flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-base md:text-lg text-gray-800 line-clamp-1">{product.name}</p>
                                            <p className="text-sm font-bold text-rose-600 mt-1">${parseFloat(product.price) || 0}</p>
                                            <span className="inline-block mt-1 bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                {product.category || "General"}
                                            </span>
                                        </div>
                                        <button className="md:hidden text-gray-400 hover:text-rose-600 transition-colors">
                                            <Heart size={20} />
                                        </button>
                                    </div>

                                    <div className="mt-4 flex flex-col gap-2 md:hidden">
                                        <button
                                            onClick={() => addToCart({
                                                id: product.id,
                                                name: product.name,
                                                price: product.price,
                                                quantity: 1,
                                                image: product.image_url,
                                                userDesign1: product.image_url,
                                                userDesign2: '',
                                                userDesign3: '',
                                                userDesign4: '',
                                                isEdited: false,
                                            })}
                                            className="w-full bg-rose-950 text-white text-sm font-bold py-2.5 rounded-lg active:scale-95 transition-transform">
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={() => handleEditPage(product.id)}
                                            className="w-full border border-gray-200 text-gray-700 text-sm font-bold py-2.5 rounded-lg active:scale-95 transition-transform"
                                        >
                                            Edit Design
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {featuredProducts.length > 4 && (
                        <div className="mt-10 flex justify-center">
                            <button onClick={handleShowMore} className="flex items-center gap-1 border-2 bg-rose-50 border-rose-950 text-rose-950 px-8 py-3 rounded-full font-bold hover:bg-rose-950 hover:text-white transition-all active:scale-95">
                                View All Best Sellers <ChevronDown size={20} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-20 text-center px-6 mb-12">
                <h3 className="font-bold text-2xl md:text-3xl text-gray-800">Our Designs</h3>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-950"></div>
                    </div>
                ) : (
                    <>
                        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:px-12 lg:px-20">
                            {templates.map((product) => (
                                <div key={product.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
                                    <div className="relative overflow-hidden aspect-square">
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                                        <div className="hidden md:flex absolute inset-0 bg-black/50 flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button
                                                onClick={() => addToCart({
                                                    id: product.id,
                                                    name: product.name,
                                                    price: product.price,
                                                    quantity: 1,
                                                    image: product.image_url,
                                                    userDesign1: product.image_url,
                                                    userDesign2: '',
                                                    userDesign3: '',
                                                    userDesign4: '',
                                                    isEdited: false,
                                                })}
                                                className="bg-white text-rose-950 font-bold px-8 py-3 rounded-full mb-4 hover:bg-rose-50 transition-colors"
                                            >
                                                Add to cart
                                            </button>
                                            <button onClick={() => handleEditPage(product.id)} className='bg-white text-rose-950 font-bold px-8 py-3 rounded-full mb-4 transition-transform hover:bg-rose-50 active:scale-95'>Edit</button>
                                            <div className="flex items-center gap-4 text-white font-semibold text-sm">
                                                <button className="flex items-center gap-1 hover:text-yellow-500"><Share size={16} /> Share</button>
                                                <button className="flex items-center gap-1 hover:text-yellow-500"><GitCompare size={16} /> Compare</button>
                                                <button className="flex items-center gap-1 hover:text-yellow-500"><Heart size={16} /> Like</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 md:p-5 text-left flex flex-col flex-grow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-base md:text-lg text-gray-800 line-clamp-1">{product.name}</p>
                                                <p className="text-sm font-bold text-rose-600 mt-1">${parseFloat(product.price) || 0}</p>
                                                <span className="inline-block mt-1 bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    {product.category || "General"}
                                                </span>
                                            </div>
                                            <button className="md:hidden text-gray-400 hover:text-rose-600 transition-colors">
                                                <Heart size={20} />
                                            </button>
                                        </div>

                                        <div className="mt-4 flex flex-col gap-2 md:hidden">
                                            <button
                                                onClick={() => addToCart({
                                                    id: product.id,
                                                    name: product.name,
                                                    price: product.price,
                                                    quantity: 1,
                                                    image: product.image_url,
                                                    userDesign1: product.image_url,
                                                    userDesign2: '',
                                                    userDesign3: '',
                                                    userDesign4: '',
                                                    isEdited: false,
                                                })}
                                                className="w-full bg-rose-950 text-white text-sm font-bold py-2.5 rounded-lg active:scale-95 transition-transform">
                                                Add to Cart
                                            </button>
                                            <button
                                                onClick={() => handleEditPage(product.id)}
                                                className="w-full border border-gray-200 text-gray-700 text-sm font-bold py-2.5 rounded-lg active:scale-95 transition-transform"
                                            >
                                                Edit Design
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {templates.length > 0 && (
                            <div className="mt-10 flex justify-center">
                                <button onClick={handleShowMore} className="flex items-center gap-1 border-2 bg-rose-50 border-rose-950 text-rose-950 px-8 py-3 rounded-full font-bold hover:bg-rose-950 hover:text-white transition-all active:scale-95">
                                    Show More <ChevronDown size={20} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <hr className='text-gray-200 mb-8 mt-4 mx-6 md:mx-12 lg:mx-24' />
            <UserFooter />
        </>
    );
};

export default UserHome;