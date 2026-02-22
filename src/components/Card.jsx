import React, { useState } from 'react'
import { TrendingUp } from 'lucide-react';

const Cards = () => {
    const [value, setValue] = useState(70);

    return (
        <>
            {/* flex-wrap add kiya taake mobile pe cards niche move ho sakein */}
            <div className='flex flex-wrap gap-5 p-5 justify-center md:justify-start mt-10'>
                
                {/* w-full mobile ke liye aur md:w-80 badi screens ke liye */}
                {/* Pehla Card */}
                <div className='w-full md:w-80 h-40 bg-blue-50 rounded-xl shadow-sm '> 
                    <h3 className='font-bold mt-4 ml-4'>New Visits</h3>
                    <div className='flex items-center'>
                        <h4 className='mt-2 ml-4 text-blue-700 text-base font-bold'>4000</h4>
                        <h4 className='text-gray-400 ml-2 mt-2'>|</h4>
                        <h4 className='mt-2 ml-2 text-gray-500 text-sm'>Total visits today</h4>
                        <h4 className='mt-2 ml-3 text-black font-bold text-xs'>7%</h4>
                        
                        <div className='ml-auto mr-4 mt-0 bg-white p-2 rounded-full shadow-sm'>
                            <TrendingUp size={'18'} className='text-blue-700' />
                        </div>
                    </div>

                    <div className="mx-4 mt-6">
                        <div className="relative w-full h-1.5 bg-gray-200 rounded-full">
                            <div 
                                className="absolute left-0 top-0 h-full bg-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${value}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 border-2 border-white rounded-full shadow-md" />
                            </div>
                        </div>
                        <button className='text-gray-700 mt-3 text-sm underline'>View Details</button>
                    </div>
                </div>

                {/* Dusra Card */}
                <div className='w-full md:w-80 h-40 bg-cyan-50 rounded-xl shadow-sm'>
                     <h3 className='font-bold mt-4 ml-4'>New Visits</h3>
                    <div className='flex items-center'>
                        <h4 className='mt-2 ml-4 text-cyan-400 text-base font-bold'>1000</h4>
                        <h4 className='text-gray-400 ml-2 mt-2'>|</h4>
                        <h4 className='mt-2 ml-2 text-gray-500 text-sm'>Total visits today</h4>
                        <h4 className='mt-2 ml-3 text-black font-bold text-xs'>5%</h4>
                        
                        <div className='ml-auto mr-4 mt-0 bg-white p-2 rounded-full shadow-sm'>
                            <TrendingUp size={'18'} className='text-cyan-400' />
                        </div>
                    </div>

                    <div className="mx-4 mt-6">
                        <div className="relative w-full h-1.5 bg-gray-200 rounded-full">
                            <div 
                                className="absolute left-0 top-0 h-full bg-cyan-400 rounded-full transition-all duration-500"
                                style={{ width: `${value}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-400 border-2 border-white rounded-full shadow-md" />
                            </div>
                        </div>
                        <button className='text-gray-700 mt-3 text-sm underline'>View Details</button>
                    </div>
                </div>

                {/* Tisra Card */}
                <div className='w-full md:w-80 h-40 bg-orange-50 rounded-xl shadow-sm'>
                     <h3 className='font-bold mt-4 ml-4'>New Visits</h3>
                    <div className='flex items-center'>
                        <h4 className='mt-2 ml-4 text-orange-700 text-base font-bold'>#500</h4>
                        <h4 className='text-gray-400 ml-2 mt-2'>|</h4>
                        <h4 className='mt-2 ml-2 text-gray-500 text-sm'>Total visits today</h4>
                        <h4 className='mt-2 ml-3 text-black font-bold text-xs'>8%</h4>
                        
                        <div className='ml-auto mr-4 mt-0 bg-white p-2 rounded-full shadow-sm'>
                            <TrendingUp size={'18'} className='text-orange-700' />
                        </div>
                    </div>

                    <div className="mx-4 mt-6">
                        <div className="relative w-full h-1.5 bg-gray-200 rounded-full">
                            <div 
                                className="absolute left-0 top-0 h-full bg-orange-600 rounded-full transition-all duration-500"
                                style={{ width: `${value}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-orange-600 border-2 border-white rounded-full shadow-md" />
                            </div>
                        </div>
                        <button className='text-gray-700 mt-3 text-sm underline'>View Details</button>
                    </div>
                </div>

            </div>
        </>
    )
}

export default Cards;