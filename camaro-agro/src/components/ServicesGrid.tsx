import React from 'react';
import { motion } from 'framer-motion';
import { Tractor, Users, Truck, Wrench } from 'lucide-react';

const services = [
    {
        icon: <Tractor className="w-10 h-10 text-camaro-yellow" />,
        title: 'Alquiler de Maquinaria',
        description: 'Flota moderna de tractores, cosechadoras y excavadoras listas para operar.',
    },
    {
        icon: <Wrench className="w-10 h-10 text-camaro-yellow" />,
        title: 'Cosecha Mecanizada',
        description: 'Servicio integral de cosecha de caña de azúcar con alta eficiencia y tecnología.',
    },
    {
        icon: <Truck className="w-10 h-10 text-camaro-yellow" />,
        title: 'Transporte Especializado',
        description: 'Logística de transporte de maquinaria y producto con seguridad garantizada.',
    },
    {
        icon: <Users className="w-10 h-10 text-camaro-yellow" />,
        title: 'Asesoría Técnica',
        description: 'Consultoría agronómica para optimizar el rendimiento de su cultivo.',
    },
];

const ServicesGrid = () => {
    return (
        <section id="servicios" className="py-20 bg-camaro-dark relative overflow-hidden">
            {/* Abstract Background Element */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-camaro-yellow/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-camaro-green/5 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-camaro-yellow font-semibold tracking-wide uppercase text-sm mb-2">Nuestros Servicios</h2>
                    <h3 className="text-3xl md:text-4xl font-bold text-white">Soluciones Integrales para el Agro</h3>
                    <div className="w-20 h-1 bg-camaro-yellow mx-auto mt-4 rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 group"
                        >
                            <div className="mb-6 bg-white/5 w-16 h-16 rounded-xl flex items-center justify-center group-hover:bg-camaro-yellow/20 transition-colors">
                                {service.icon}
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3">{service.title}</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServicesGrid;
