import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Phone, Mail } from 'lucide-react';

const ContactForm = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log('Form submitted:', formData);
        alert('Gracias por su mensaje. Nos pondremos en contacto pronto.');
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <section id="contact" className="py-20 bg-gradient-to-b from-camaro-dark to-black text-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold mb-6">Hablemos de su próximo proyecto</h2>
                        <p className="text-gray-400 mb-8 text-lg">
                            Estamos listos para potenciar su cultivo con la mejor maquinaria y servicio del mercado.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="bg-camaro-yellow/10 p-3 rounded-lg">
                                    <MapPin className="w-6 h-6 text-camaro-yellow" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Ubicación Principal</h3>
                                    <p className="text-gray-400">Valle del Cauca, Colombia</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-camaro-yellow/10 p-3 rounded-lg">
                                    <Phone className="w-6 h-6 text-camaro-yellow" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Teléfonos</h3>
                                    <p className="text-gray-400">+57 300 123 4567</p>
                                    <p className="text-gray-400">+57 602 555 5555</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-camaro-yellow/10 p-3 rounded-lg">
                                    <Mail className="w-6 h-6 text-camaro-yellow" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Email</h3>
                                    <p className="text-gray-400">contacto@camaroagro.com</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl shadow-xl"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Nombre Completo</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-camaro-yellow focus:ring-1 focus:ring-camaro-yellow transition-colors"
                                    placeholder="Juan Pérez"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Correo Electrónico</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-camaro-yellow focus:ring-1 focus:ring-camaro-yellow transition-colors"
                                    placeholder="juan@empresa.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Mensaje</label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-camaro-yellow focus:ring-1 focus:ring-camaro-yellow transition-colors"
                                    placeholder="Estoy interesado en alquilar..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-camaro-yellow text-camaro-dark font-bold py-4 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg flex items-center justify-center gap-2"
                            >
                                Enviar Mensaje <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default ContactForm;
