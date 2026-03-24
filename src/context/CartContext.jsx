import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../config/supabaseClient'; 

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserCart = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                const { data, error } = await supabase
                    .from('cart')
                    .select('*')
                    .eq('user_id', user.id);

                if (!error && data) {
                    const formattedItems = data.map(item => ({
                        ...item.product_details,
                        price: parseFloat(item.product_details?.price) || 0,
                        quantity: item.quantity,
                        db_id: item.id 
                    }));
                    setCartItems(formattedItems);
                }
            } else {
                setCartItems([]);
            }
            setLoading(false);
        };

        fetchUserCart();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') fetchUserCart();
            if (event === 'SIGNED_OUT') setCartItems([]); 
        });

        return () => authListener.subscription.unsubscribe();
    }, []);

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    const addToCart = async (product, showModal = true) => {
        const { data: { user } } = await supabase.auth.getUser();
        
        const productWithValidPrice = {
            ...product,
            price: parseFloat(product.price) || 0
        };
        
        const existingItem = cartItems.find(item => item.id === product.id);
        let newItems;

        if (existingItem) {
            newItems = cartItems.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
            newItems = [...cartItems, { ...productWithValidPrice, quantity: 1 }];
        }

        setCartItems(newItems);

        if (user) {
            await supabase.from('cart').upsert({
                user_id: user.id,
                product_id: product.id,
                quantity: existingItem ? existingItem.quantity + 1 : 1,
                product_details: productWithValidPrice
            }, { onConflict: 'user_id, product_id' }); 
        }

        if (showModal) openCart();
    };

    const updateQuantity = async (id, amount) => {
        const updatedItems = cartItems.map(item =>
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
        );
        setCartItems(updatedItems);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const item = updatedItems.find(i => i.id === id);
            await supabase.from('cart')
                .update({ quantity: item.quantity })
                .eq('user_id', user.id)
                .eq('product_id', id);
        }
    };
    
    const removeFromCart = async (id) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('cart').delete().eq('user_id', user.id).eq('product_id', id);
        }
    };

 const clearCart = async () => {
    setCartItems([]);
    
    localStorage.removeItem('cart'); 

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error } = await supabase
                .from('cart')
                .delete()
                .eq('user_id', user.id);
            
            if (error) throw error;
            console.log("✅ Cart deleted from DB");
        }
    } catch (err) {
        console.error("❌ Error clearing cart in DB:", err);
    }
};
   
    const subtotal = cartItems.reduce((acc, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        return acc + (price * quantity);
    }, 0);

    return (
        <CartContext.Provider value={{ 
            isCartOpen, openCart, closeCart, 
            cartItems, addToCart, removeFromCart, updateQuantity, 
            clearCart, subtotal, loading 
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);