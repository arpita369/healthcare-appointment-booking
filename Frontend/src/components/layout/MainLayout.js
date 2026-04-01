import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { Menu, X, LogOut, User, Calendar, Clock, Home, Heart, Search, ChevronDown, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import LoadingSpinner from '../ui/LoadingSpinner';
import UniversalSearch from '../../features/search/UniversalSearch';

const NAVIGATION_CONFIG = {
  patient: [
    { name: 'Dashboard', href: '/app/patient/dashboard', icon: Home, description: 'Your health overview' },
    { name: 'Appointments', href: '/app/patient/appointments', icon: Calendar, description: 'Book and manage' },
    { name: 'Feedback', href: '/app/patient/feedback', icon:MessageSquare, description: 'Give your feedback' },
    { name: 'Profile', href: '/app/patient/profile', icon: User, description: 'Manage your profile' }
  ],
  doctor: [
    { name: 'Dashboard', href: '/app/doctor/dashboard', icon: Home, description: 'Your practice overview' },
    { name: 'Appointments', href: '/app/doctor/appointments', icon: Calendar, description: 'Manage appointments' },
    { name: 'Unvailability', href: '/app/doctor/availability', icon: Clock, description: 'Set your availability' },
    { name: 'Profile', href: '/app/doctor/profile', icon: User, description: 'Manage your profile' }
  ],
 
};

const SEARCH_PLACEHOLDERS = {
  patient: 'Search doctors by name, specialization...',
  doctor: 'Search patients by name, condition...',
  default: 'Search...'
};

// Reusable Components
const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
      <Heart className="w-5 h-5 text-white" />
    </div>
    <span className="text-lg font-bold text-gray-900">HealthCare</span>
  </div>
);

const UserProfile = ({ user, showStatus = false, className = "" }) => (
  <div className={`flex items-center ${className}`}>
    <Avatar className="h-10 w-10 ring-2 ring-blue-100">
      <AvatarImage src={user.avatar} />
      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
        {user.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
      </AvatarFallback>
    </Avatar>
    <div className="ml-3 flex-1">
      <p className="text-sm font-semibold text-gray-900 truncate">
        {user.name || 'User Name'}
      </p>
      <div className="flex items-center gap-2">
        {showStatus && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
        <p className="text-xs text-green-600 capitalize">
          {user.role || 'user'} • Online
        </p>
      </div>
    </div>
  </div>
);

const NavigationItem = ({ item, isActive,  onClick }) => (
  <button
    onClick={() => onClick(item.href)}
    className={cn(
      "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
      isActive
        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600 shadow-sm"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
    )}
  >
    <item.icon
      className={cn(
        "mr-3 h-5 w-5 transition-colors",
        isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
      )}
    />
    <div className="flex flex-col items-start">
      <span>{item.name}</span>
      <span className="text-xs text-gray-500">{item.description}</span>
    </div>
 
  </button>
);

const Navigation = ({ navItems, currentPath, onNavigate, className = "" }) => (
  <nav className={`space-y-1 ${className}`}>
    {navItems.map((item) => (
      <NavigationItem
        key={item.name}
        item={item}
        isActive={currentPath === item.href}
        onClick={onNavigate}
      />
    ))}
  </nav>
);

const Sidebar = ({ user, navItems, currentPath, onNavigate, isMobile = false, onClose }) => (
  <div className="flex flex-col w-full h-full">
    {/* Header */}
    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100 bg-white sticky top-0 z-10">
      <Logo />
      {isMobile && (
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      )}
    </div>

    {/* Navigation */}
    <Navigation
      navItems={navItems}
      currentPath={currentPath}
      onNavigate={onNavigate}
      className="flex-1 overflow-y-auto px-3 py-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
    />

    {/* User Profile */}
    <div className="px-3 py-4 border-t border-gray-100 bg-white sticky bottom-0">
      <UserProfile 
        user={user} 
        showStatus={!isMobile}
        className={!isMobile ? "group cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors" : ""}
      />
      {!isMobile && <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors ml-auto" />}
    </div>
  </div>
);

const SearchBar = ({ placeholder, value, onChange, onKeyDown, onClick }) => (
  <div className="hidden sm:block">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onClick={onClick}
        className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200 focus:w-80 cursor-pointer hover:shadow-md"
      />
    </div>
  </div>
);

const UserMenu = ({ user, isOpen, onToggle, onNavigate, onLogout, isLoading }) => (
  <div className="relative user-menu">
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="flex items-center gap-2 px-3"
    >
      <Avatar className="h-7 w-7">
        <AvatarImage src={user.avatar} />
        <AvatarFallback className="text-xs">
          {user.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="hidden sm:block text-sm font-medium">{user.name}</span>
      <ChevronDown className="w-4 h-4" />
    </Button>

    {isOpen && (
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
        <div className="px-3 py-2 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        
        <button
          onClick={() => { onNavigate(`/app/${user?.role}/profile`); onToggle(); }}
          className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <User className="w-4 h-4 mr-2" />
          Profile Settings
        </button>
        
        <button
          onClick={onLogout}
          disabled={isLoading}
          className="w-full flex items-center px-3 py-2 text-sm text-red-700 hover:bg-red-50"
        >
          {isLoading ? (
            <LoadingSpinner size="xs" className="mr-2" />
          ) : (
            <LogOut className="w-4 h-4 mr-2" />
          )}
          Sign Out
        </button>
      </div>
    )}
  </div>
);

const MainLayout = () => {
  const { user, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = NAVIGATION_CONFIG[user?.role] || NAVIGATION_CONFIG.patient;
  const searchPlaceholder = SEARCH_PLACEHOLDERS[user?.role] || SEARCH_PLACEHOLDERS.default;

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') setShowSearch(true);
  };

  if (!user) {
    return <LoadingSpinner fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0 lg:w-64 bg-white border-r border-gray-200 fixed left-0 top-0 h-full z-30 shadow-sm">
        <Sidebar
          user={user}
          navItems={navItems}
          currentPath={location.pathname}
       
          onNavigate={navigate}
        />
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 lg:hidden shadow-xl",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar
          user={user}
          navItems={navItems}
          currentPath={location.pathname}
        
          onNavigate={navigate}
          isMobile={true}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden hover:bg-gray-100"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              <div className="lg:hidden">
                <Logo />
              </div>

              <SearchBar
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onClick={() => setShowSearch(true)}
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/app/${user?.role}/notifications`)}
                className="relative hover:bg-gray-100"
              >  
              </Button>

              <UserMenu
                user={user}
                isOpen={userMenuOpen}
                onToggle={() => setUserMenuOpen(!userMenuOpen)}
                onNavigate={navigate}
                onLogout={handleLogout}
                isLoading={isLoading}
              />
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-4 sm:p-6 lg:p-8 min-h-full">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
      
      {/* Universal Search Modal */}
      {showSearch && (
        <UniversalSearch 
          onClose={() => {
            setShowSearch(false);
            setSearchQuery('');
          }}
          initialQuery={searchQuery}
        />
      )}
    </div>
  );
};

export default MainLayout;