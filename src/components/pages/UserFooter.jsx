import React from 'react';
import { NavLink } from 'react-router-dom'; 

const UserFooter = () => {
  return (
    <>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:flex lg:justify-between px-6 md:px-12 lg:px-24 mb-8 gap-10 md:gap-12 mt-12'>
        
        <div>
          <h3 className='font-bold text-lg tracking-tight text-gray-900'>MoonPanda.</h3>
          <p className='mt-12 text-gray-500 max-w-[250px]'>Lorem ipsum dolor sit amet, consectetur adipisicing</p>
          <p className='text-gray-500'>Gables</p>
          <p className='text-gray-500'>Fl 3314 USA</p>
        </div>

        <div>
          <ul>
            <li className='text-gray-500 font-semibold'>Links</li>
            
            <li className='mt-8 md:mt-12'>
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `font-semibold transition-all duration-300 ${isActive ? "text-rose-800 font-bold" : "text-gray-800 hover:text-rose-600"}`
                }
              >
                Home
              </NavLink>
            </li>

            <li className='mt-6'>
              <NavLink 
                to="/all-designs" 
                className={({ isActive }) => 
                  `font-semibold transition-all duration-300 ${isActive ? "text-rose-800 font-bold" : "text-gray-800 hover:text-rose-600"}`
                }
              >
                Shop
              </NavLink>
            </li>

            <li className='mt-6'>
              <NavLink 
                to="/about" 
                className={({ isActive }) => 
                  `font-semibold transition-all duration-300 ${isActive ? "text-rose-800 font-bold" : "text-gray-800 hover:text-rose-600"}`
                }
              >
                About
              </NavLink>
            </li>

            <li className='mt-6'>
              <NavLink 
                to="/contact" 
                className={({ isActive }) => 
                  `font-semibold transition-all duration-300 ${isActive ? "text-rose-800 font-bold" : "text-gray-800 hover:text-rose-600"}`
                }
              >
                Contact
              </NavLink>
            </li>
          </ul>
        </div>

        <div>
          <ul>
            <li className='text-gray-500 font-semibold'>Help</li>
            <li className='mt-8 md:mt-12 font-semibold cursor-pointer hover:text-rose-600'>Payment Options</li>
            <li className='mt-6 font-semibold cursor-pointer hover:text-rose-600'>Returns</li>
            <li className='mt-6 font-semibold cursor-pointer hover:text-rose-600'>Privacy Policies</li>
          </ul>
        </div>

        <div>
          <p className='text-gray-500 font-semibold'>Newsletter</p>
          <div className='mt-8 md:mt-12 flex flex-wrap gap-4'>
            <input 
              type="email" 
              placeholder='Enter Your Email Address' 
              className='border-b border-gray-400 outline-none w-full sm:w-auto pb-2 bg-transparent text-sm focus:border-black transition-colors' 
            />
            <button className='font-semibold border-b border-black pb-2 text-sm uppercase tracking-wider hover:opacity-60 transition-opacity'>
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <hr className='border-gray-200 mb-8 mx-6 md:mx-12 lg:mx-24' />
      <p className='px-6 md:px-12 lg:px-24 mb-10 text-center md:text-left text-gray-600'>
        2026 moonPanda. All rights reserved
      </p>
    </>
  )
}

export default UserFooter;