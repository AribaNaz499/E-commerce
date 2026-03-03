import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import LogoImg from '../../assets/images/logo.png';
import BackgroundImg from '../../assets/images/bg.jpg';
import PosterImg from '../../assets/images/poster.jpg';
import Logos from '../../assets/images/logos.jpg';
import SocialMedia from '../../assets/images/socialMedia.jpg';
import KidsDesign from '../../assets/images/kids.jpg'
import CanvaDesign from '../../assets/images/CanvaDesign.jpg';
import { Search, User, Heart, ShoppingCart, Menu, X, Share, GitCompare, ChevronDown } from 'lucide-react'; 
import UserNavbar from './UserNavbar';
import UserFooter from './UserFooter';
import { supabase } from "../../supabase/client"; 

const UserHome = () => {
    const [templates, setTemplates] = useState([]);
    const navigate = useNavigate();

    const fetchTemplates = async () => {
        try {

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { descending: false })
                .limit(8);

            if (error) throw error;
            setTemplates(data || []);
        } catch (err) {
            console.error("Fetch Error:", err.message);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleShowMore = () => {
        navigate('/all-designs');
    };

     const handleEditPage = (id) => {
       navigate(`/design-editor/${id}`)
    };

    const handleCategoryClick = (title) => {
        const slug = title.replace(/\s+/g, '-').toLowerCase();
        navigate(`/category/${slug}`);
    };

    return (
        <>
            <UserNavbar />

           
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


            <div className="mt-20 text-center px-6 mb-12">
                <h3 className="font-bold text-2xl md:text-3xl text-gray-800">Our Designs</h3>
                <p className="mt-2 text-gray-500 max-w-2xl mx-auto">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:px-12 lg:px-20">
                    {templates.map((product) => (
                        <div key={product.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100">
                            <div className="relative overflow-hidden aspect-square">
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button className="bg-white text-yellow-600 font-bold px-8 py-3 rounded-full mb-6 transition-transform hover:bg-rose-100 active:scale-95">Add to cart</button>
                                    <button  onClick={() => handleEditPage(product.id)}
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
                                <span className="inline-block mt-3 bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{product.category || "General"}</span>
                            </div>
                        </div>
                    ))}
                </div>

                
                {templates.length > 0 && (
                    <div className="mt-10 flex justify-center">
                        <button 
                            onClick={handleShowMore}
                            className="flex items-center gap-1 border-2 bg-rose-50 border-rose-950 text-rose-950 px-8 py-3 rounded-full font-bold hover:bg-rose-950 hover:text-white transition-all active:scale-95"
                        >
                            Show More
                            <ChevronDown size={20} />
                        </button>
                    </div>
                )}
            </div>

            <hr className='text-gray-200 mb-8 mt-4 mx-6 md:mx-12 lg:mx-24' />
            <UserFooter/>
        </>
    )
}

export default UserHome;