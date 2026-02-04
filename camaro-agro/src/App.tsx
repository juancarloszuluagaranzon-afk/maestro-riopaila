import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ServicesGrid from './components/ServicesGrid';
import ContactForm from './components/ContactForm';

function App() {
  return (
    <div className="bg-camaro-light min-h-screen">
      <Navbar />
      <HeroSection />
      <ServicesGrid />
      <ContactForm />

      {/* Footer placement */}
      <footer className="bg-black text-white/40 py-8 text-center border-t border-white/10">
        <p>© 2026 CamaroAgro. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default App;
