'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { Search, Globe, Menu, Heart, Compass, Briefcase, Home } from 'lucide-react';

interface NavbarProps {
  onOpenSearch?: () => void;
  searchSummary?: {
    location?: string;
    dates?: string;
    guests?: string;
  };
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, searchSummary }) => {
  const pathname = usePathname();
  const { role, setRole, wishlistIds } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [globeOpen, setGlobeOpen] = useState(false);

  const roleCtaLabel = role === 'guest' ? 'Become a Host' : 'Switch to Guest';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-[#FF385C] font-bold text-2xl tracking-tight">
            <svg className="w-9 h-9 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.011.315c0 4.308-3.3 7.806-7.5 7.806-3.155 0-5.877-1.975-7.005-4.821l-.095-.259-.095.259C13.677 29.831 10.955 31.8 7.8 31.8 3.6 31.8.3 28.302.3 23.994c0-.986.257-1.92.971-3.711l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C10.337 1.963 11.792 1 13.8 1h2.4zm0 2.5h-2.4c-1.077 0-2.073.551-3.037 2.3l-.442.855c-1.848 3.623-5.918 12.167-6.84 14.316l-.119.29c-.58 1.455-.762 2.106-.799 2.766l-.007.235c0 3.018 2.302 5.466 5.244 5.466 2.378 0 4.46-1.583 5.12-3.88l.128-.485.498-2.001h2.428l.498 2.001.128.485c.66 2.297 2.742 3.88 5.12 3.88 2.942 0 5.244-2.448 5.244-5.466 0-.645-.175-1.282-.799-2.766l-.119-.29c-.922-2.149-4.992-10.693-6.84-14.316l-.442-.855C18.073 4.051 17.077 3.5 16 3.5zm0 13c1.933 0 3.5 1.567 3.5 3.5s-1.567 3.5-3.5 3.5-3.5-1.567-3.5-3.5 1.567-3.5 3.5-3.5zm0 2.5c-.552 0-1 .448-1 1s.448 1 1 1 1-.448 1-1-.448-1-1-1z" />
            </svg>
            <span className="hidden sm:inline font-extrabold text-xl">airbnb</span>
          </Link>

          <nav className="hidden md:flex items-center justify-center gap-8 text-sm">
            <span className="font-semibold text-gray-900">All</span>
            <span className="font-medium text-gray-500 hover:text-gray-900 transition-colors">Homes</span>
            <span className="font-medium text-gray-500 hover:text-gray-900 transition-colors">Experiences</span>
            <span className="font-medium text-gray-500 hover:text-gray-900 transition-colors">Services</span>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 justify-self-end">
            <button
              onClick={() => setRole(role === 'guest' ? 'host' : 'guest')}
              className="text-sm font-semibold hover:bg-gray-100 rounded-full py-2.5 px-3 sm:px-4 transition-colors hidden md:block"
            >
              {roleCtaLabel}
            </button>

            <div className="relative hidden sm:block">
              <button
                onClick={() => setGlobeOpen((prev) => !prev)}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Language and Region"
              >
                <Globe className="w-5 h-5" />
              </button>
              {globeOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Language & Region</p>
                  </div>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">English (IN)</button>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">English (US)</button>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">India (INR ₹)</button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 border border-gray-300 rounded-full p-2 hover:shadow-md transition-shadow bg-white"
              >
                <Menu className="w-4 h-4 text-gray-600 ml-1" />
                <div className="bg-gray-700 text-white rounded-full p-1 w-7 h-7 flex items-center justify-center text-xs font-bold">
                  {role === 'guest' ? 'G' : 'H'}
                </div>
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Persona</p>
                    <p className="text-sm font-bold text-gray-900">
                      {role === 'guest' ? 'John Guest (Guest)' : 'Sarah Jenkins (Host)'}
                    </p>
                  </div>

                  <Link
                    href="/"
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-50 ${
                      pathname === '/' ? 'text-[#FF385C] font-semibold' : 'text-gray-700'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    Explore Listings
                  </Link>

                  <Link
                    href="/trips"
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-50 ${
                      pathname === '/trips' ? 'text-[#FF385C] font-semibold' : 'text-gray-700'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    My Trips
                  </Link>

                  <Link
                    href="/wishlist"
                    className={`flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-gray-50 ${
                      pathname === '/wishlist' ? 'text-[#FF385C] font-semibold' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-rose-500" />
                      Wishlists
                    </div>
                    {wishlistIds.size > 0 && (
                      <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {wishlistIds.size}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/host"
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-50 ${
                      pathname === '/host' ? 'text-[#FF385C] font-semibold' : 'text-gray-700'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    Host Dashboard & Listings
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={() => setRole(role === 'guest' ? 'host' : 'guest')}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>{role === 'guest' ? 'Become a Host' : 'Switch to Guest'}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 font-bold px-2 py-1 rounded-md uppercase">
                      {role}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {onOpenSearch && (
          <div className="pb-5">
            <button
              onClick={onOpenSearch}
              className="mx-auto w-full max-w-3xl flex items-center border border-gray-300 rounded-full py-2.5 px-2 shadow-xs hover:shadow-md transition-shadow cursor-pointer text-sm"
            >
              <div className="flex-1 text-left px-4 border-r border-gray-200">
                <p className="text-[11px] font-bold text-gray-900 uppercase tracking-wide">Where</p>
                <p className="text-sm font-medium text-gray-600 truncate">{searchSummary?.location || 'Search destinations'}</p>
              </div>
              <div className="hidden sm:block flex-1 text-left px-4 border-r border-gray-200">
                <p className="text-[11px] font-bold text-gray-900 uppercase tracking-wide">When</p>
                <p className="text-sm font-medium text-gray-600 truncate">{searchSummary?.dates || 'Add dates'}</p>
              </div>
              <div className="hidden md:block flex-1 text-left px-4">
                <p className="text-[11px] font-bold text-gray-900 uppercase tracking-wide">Who</p>
                <p className="text-sm font-medium text-gray-600 truncate">{searchSummary?.guests || 'Add guests'}</p>
              </div>
              <div className="bg-[#FF385C] text-white p-3 rounded-full flex items-center justify-center ml-2 shrink-0">
                <Search className="w-4 h-4 stroke-[2.5]" />
              </div>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
