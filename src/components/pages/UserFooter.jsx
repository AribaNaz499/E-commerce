import React from 'react'

const UserFooter = () => {
  return (
    <>
    
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:flex lg:justify-between px-6 md:px-12 lg:px-24 mb-8 gap-10 md:gap-12'>
        
        <div >
            <h3 className='font-bold text-lg tracking-tight text-gray-900'>MoonPanda.</h3>
            <p className='mt-12 text-gray-500'>Lorem ipsum dolor sit amet, consectetur adipisicing</p>
            <p className='text-gray-500'>Gables</p>
            <p className='text-gray-500'>Fl 3314 USA</p>
        </div>

        <div>
            <ul>
                <li className='text-gray-500 font-semibold'>Links</li>
                <li className='mt-8 md:mt-12 font-semibold'>Home</li>
                <li className='mt-6 font-semibold'>Shop</li>
                <li className='mt-6 font-semibold'>About</li>
                <li className='mt-6 font-semibold'>Contact</li>
            </ul>
        </div>

        <div>
            <ul>
                <li className='text-gray-500 font-semibold'>Help</li>
                <li className='mt-8 md:mt-12 font-semibold'>Payment Options</li>
                <li className='mt-6 font-semibold'>Returns</li>
                <li className='mt-6 font-semibold'>Privacy Policies</li>
            </ul>
        </div>

       <div>
  <p className='text-gray-500 font-semibold'>Newsletter</p>
  <div className='mt-8 md:mt-12 flex flex-wrap gap-4'>
    
    <input 
      type="email" 
      placeholder='Enter Your Email Address' 
      className='border-b border-gray-400 outline-none w-full sm:w-auto pb-2 bg-transparent text-sm' 
    />
    
    
    <button className='font-semibold border-b border-black pb-2 text-sm uppercase tracking-wider'>
      Subscribe
    </button>
  </div>
</div>
      </div>

      <hr className='text-gray-200 mb-8 mx-6 md:mx-12 lg:mx-24' />
      <p className='px-6 md:px-12 lg:px-24 mb-10 text-center md:text-left'>2026 moonPanda. All rights reserved</p>
    </>
  )
}

export default UserFooter;