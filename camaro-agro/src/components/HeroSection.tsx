import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';

const HeroSection = () => {
    return (
        <div className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-camaro-dark">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1590247813693-55b2d7159c9d?q=80&w=2070&auto=format&fit=crop"
                    alt="Heavy Machinery in Field"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-camaro-yellow font-bold text-lg mb-2 uppercase tracking-wide">
                            Renta de Maquinaria Amarilla
                        </h2>
                        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
                            Potencia para <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-camaro-green to-emerald-400">
                                Tu Cosecha
                            </span>
                        </h1>
                        <p className="text-xl text-gray-300 mb-8 max-w-lg">
                            Soluciones mecanizadas especializadas para el cultivo de caña de azúcar. Eficiencia, fuerza y tecnología en cada hectárea.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="px-8 py-4 bg-camaro-yellow text-camaro-dark font-bold text-lg rounded-full shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] hover:bg-yellow-400 transition-all flex items-center justify-center gap-2">
                                Solicitar Cotización <ArrowRight className="w-5 h-5" />
                            </button>
                            <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold text-lg rounded-full hover:bg-white/20 transition-all">
                                Ver Catálogo
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <ChevronDown className="w-8 h-8" />
            </motion.div>
        </div>
    );
};

export default HeroSection;
