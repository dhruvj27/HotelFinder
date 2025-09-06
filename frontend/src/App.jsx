import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header'
import About from './pages/About'
import Contact from './pages/Contact'
import Home from './pages/Home'
import Team from './pages/Team'
import Footer from './components/Footer'
import BookingPage from './pages/BookingPage';
import HotelDetails from './pages/HotelDetails';
import SearchResults from './pages/SearchResults';
import NotFound from './pages/NotFound'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            {/* Main Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/team" element={<Team />} />
            
            {/* Hotel & Search Pages */}
            <Route path="/results" element={<SearchResults />} />
            <Route path="/hotel/:id" element={<HotelDetails />} />
            
            {/* Booking routes */}
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/booking/:hotelId" element={<BookingPage />} />
            
            {/* 404 Page */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App