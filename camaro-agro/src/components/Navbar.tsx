import React, { useState } from 'react';
import { Menu, X, Tractor } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Inicio', href: '#' },
        { name: 'Maquinaria', href: '#maquinaria' },
        { name: 'Servicios', href: '#servicios' },
        { name: 'Nosotros', href: '#nosotros' },
        { name: 'Contacto', href: '#contacto' },
    ];

    return (
        <nav className="fixed w-full z-50 top-0 left-0 bg-camaro-dark/80 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center space-x-2">
                        <Tractor className="h-8 w-8 text-camaro-yellow" />
                        <span className="text-white text-2xl font-bold tracking-tight">
                            Camaro<span className="text-camaro-yellow">Agro</span>
                        </span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-gray-300 hover:text-camaro-yellow px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <a
                                href="#cotizar"
                                className="bg-camaro-yellow text-camaro-dark hover:bg-yellow-400 px-5 py-2 rounded-full font-bold text-sm transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:shadow-[0_0_20px_rgba(255,215,0,0.5)]"
                            >
                                Cotizar Ahora
                            </a>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden bg-camaro-dark/95 backdrop-blur-xl"
                >
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-700">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-gray-300 hover:text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                        <a
                            href="#cotizar"
                            className="text-camaro-dark bg-camaro-yellow hover:bg-yellow-500 block px-3 py-2 rounded-md text-base font-bold mt-4 text-center"
                            onClick={() => setIsOpen(false)}
                        >
                            Cotizar Ahora
                        </a>
                    </div>
                </motion.div>
            )}
        </nav>
    );
};

export default Navbar;
