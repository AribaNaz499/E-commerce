import React from 'react'
import UserNavbar from './UserNavbar'
import UserFooter from './UserFooter'
import { ChevronRight, Phone, MapPin, Clock, Trophy, BadgeCheck, PackageSearch, Headset } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageBg from "../../assets/images/pagebg.avif";

const Contact = () => {
    const navigate = useNavigate();
    const home = () => navigate("/");

    return (
        <div className="w-full overflow-hidden bg-white">
            <UserNavbar />

            <div className="w-full h-40 md:h-56 bg-cover bg-center flex flex-col justify-center items-center px-4" style={{ backgroundImage: `url(${PageBg})` }}>
                <h3 className="text-gray-900 text-3xl md:text-4xl font-bold">Contact</h3>
                <nav className="flex items-center gap-2 text-sm mt-2">
                    <span onClick={home} className="cursor-pointer hover:text-rose-600 font-bold text-gray-900 text-lg">Home</span>
                    <ChevronRight size={14} />
                    <span className="text-gray-500 text-lg font-medium">Contact</span>
                </nav>
            </div>

            <div className='mt-16 md:mt-24 px-6 text-center mb-16'>
                <h4 className='font-bold text-2xl md:text-3xl mb-3 text-gray-900'>Get In Touch With Us</h4>
                <p className='text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed'>
                    For More Information About Our Product & Services, Please Feel Free To Drop Us An Email.
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 mb-24 flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-32">
                
                <div className="w-full lg:w-1/3 space-y-12">
                    <div className="flex items-start gap-6">
                        <MapPin className="text-black shrink-0" size={28} />
                        <div>
                            <h3 className="font-bold text-xl text-gray-900">Address</h3>
                            <p className="text-gray-800 text-sm leading-snug">236 5th SE Avenue, New York NY10000, United States</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-6">
                        <Phone className="text-black shrink-0" size={28} />
                        <div>
                            <h3 className="font-bold text-xl text-gray-900">Phone</h3>
                            <p className="text-gray-800 text-sm">Mobile: +(84) 546-6789</p>
                            <p className="text-gray-800 text-sm">Hotline: +(84) 456-6789</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-6">
                        <Clock className="text-black shrink-0" size={28} />
                        <div>
                            <h3 className="font-bold text-xl text-gray-900">Working Time</h3>
                            <p className="text-gray-800 text-sm">Mon-Fri: 9:00 - 22:00</p>
                            <p className="text-gray-800 text-sm">Sat-Sun: 9:00 - 21:00</p>
                        </div>
                    </div>
                </div>

              
                <div className="w-full lg:w-2/3">
                    <form className="space-y-8">
                        {["Your name", "Email address", "Subject"].map((label, idx) => (
                            <div key={idx}>
                                <label className="block font-semibold text-gray-900 mb-4">{label}</label>
                                <input
                                    type={label.includes("Email") ? "email" : "text"}
                                    placeholder={label === "Subject" ? "Optional" : "Abc"}
                                    className="w-full md:max-w-md p-5 border border-gray-300 rounded-xl outline-none focus:border-rose-400 placeholder:text-gray-300"
                                />
                            </div>
                        ))}
                        <div>
                            <label className="block font-semibold text-gray-900 mb-4">Message</label>
                            <textarea placeholder="Hi! I'd like to ask about" rows="3" className="w-full md:max-w-md p-5 border border-gray-300 rounded-xl outline-none focus:border-rose-400 resize-none"></textarea>
                        </div>
                        <button className="bg-rose-800 hover:bg-rose-700 text-white w-full md:w-[230px] py-4 rounded-md font-medium text-lg shadow-sm transition-colors">Submit</button>
                    </form>
                </div>
            </div>

            <div className="w-full bg-rose-100 py-20 px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center lg:text-left">
                    
                    <div className="flex flex-col lg:flex-row items-center gap-4">
                        <Trophy size={50} className="text-black" />
                        <div>
                            <h3 className="font-bold text-xl text-gray-900">High Quality</h3>
                            <p className="text-gray-500 text-sm">crafted from top materials</p>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-4">
                        <BadgeCheck size={50} className="text-black" />
                        <div>
                            <h3 className="font-bold text-xl text-gray-900">Warranty Protection</h3>
                            <p className="text-gray-500 text-sm">Over 2 years</p>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-4">
                        <PackageSearch size={50} className="text-black" />
                        <div>
                            <h3 className="font-bold text-xl text-gray-900">Free Shipping</h3>
                            <p className="text-gray-500 text-sm">Order over 150 $</p>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-4">
                        <Headset size={50} className="text-black" />
                        <div>
                            <h3 className="font-bold text-xl text-gray-900">24 / 7 Support</h3>
                            <p className="text-gray-500 text-sm">Dedicated support</p>
                        </div>
                    </div>

                </div>
            </div>

            <div className='w-full px-6 md:px-20 py-10'>
                <div className='border-t-2 border-gray-100 w-full'></div>
            </div>

            <UserFooter />
        </div>
    )
}

export default Contact