import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut, ChevronDown, User, LayoutDashboard, Rocket, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import ThemeToggle from './ThemeToggle';
import { useRouter } from 'next/navigation';
import RazorpayPayment from '../RazorpayPayment';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [recharge, setRecharge] = useState(false);
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('Guest');
  const [userId, setUserId] = useState('N/A');
  const [campaignName, setCampaignName] = useState('N/A');
  const userMenuRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  useEffect(() => {
    const studentData = localStorage.getItem('student');
    if (studentData) {
      try {
        const parsedData = JSON.parse(studentData);
        setUsername(parsedData.username || 'Guest');
        setUserId(parsedData.studentId || 'N/A');
        setCampaignName(parsedData.adminuser || 'N/A');
        setUserRole(parsedData.type || null);
        const token = localStorage.getItem('token');
        setToken(token || '');
      } catch (e) {
        setUsername('Guest');
        setUserId('N/A');
        setCampaignName('N/A');
        setUserRole(null);
        setToken('');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    setUserMenuOpen(false);
    toast.success('Logged out successfully');
    router.push('/student/login');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        const isDropdownContent =
          event.target.closest('[data-radix-popper-content-wrapper]') ||
          event.target.closest('[role="menu"]') ||
          event.target.closest('.dropdown-content');
        if (!isDropdownContent) {
          setUserMenuOpen(false);
        }
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const getInitials = (name = '') => {
    const words = name.trim().split(' ');
    return words
      .map((w) => w[0]?.toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const navLinks = [
    {
      href: '/',
      name: 'Your Profile',
      icon: <User className="w-4 h-4" />,
    },
    {
      href: 'https://esamwad.iotcom.io/dashboard/login',
      name: 'Admin Login',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
  ];

  return (
    <>
      <RazorpayPayment {...{ recharge, setRecharge }} />

      <header className="w-full bg-white dark:bg-background shadow-md border-b border-border sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          {/* Logo and Brand */}
          <Link href={'/'} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-foreground">Student Panel</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <nav className="flex gap-2">
              <Button
                onClick={() => setRecharge(true)}
                variant={recharge ? 'default' : 'outline'}
                className="relative flex items-center gap-2"
                aria-label="Show Missed Calls"
                type="button"
              >
                Recharge
              </Button>
            </nav>
            <div className="h-6 w-px bg-border mx-1"></div>

            {/* Modern User Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                className="flex items-center cursor-pointer gap-3 px-3 py-2 h-auto hover:bg-accent"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm shadow-sm">
                  {getInitials(username)}
                </div>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-sm font-medium text-foreground leading-none">{username}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">{userId}</span>
                </div>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform duration-200 text-muted-foreground',
                    userMenuOpen && 'rotate-180'
                  )}
                />
              </Button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-popover border rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2 duration-200">
                  {/* User Info Header */}
                  <div className="px-4 py-4 bg-muted/50 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold shadow-sm">
                        {getInitials(username)}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="text-sm font-semibold text-foreground truncate">{username}</div>
                        <div className="text-xs text-muted-foreground">ID: {userId}</div>
                      </div>
                    </div>
                  </div>

                  {/* Campaign Info */}
                  <div className="px-4 py-3 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Rocket className="w-4 h-4" />
                        Admin
                      </div>
                      <span className="text-sm font-medium text-foreground truncate max-w-[180px] capitalize">
                        {campaignName}
                      </span>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="py-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        {link.icon}
                        {link.name}
                      </Link>
                    ))}
                  </div>

                  {/* Theme Toggle */}
                  <div className="py-3 px-4 border-t">
                    <ThemeToggle />
                  </div>

                  {/* Logout */}
                  <div className="py-2 border-t">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2 transition-transform duration-200 hover:scale-105"
            >
              <div className="relative w-5 h-5">
                <Menu
                  className={cn(
                    'w-5 h-5 absolute inset-0 transition-all duration-300 ease-in-out',
                    mobileMenuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
                  )}
                />
                <X
                  className={cn(
                    'w-5 h-5 absolute inset-0 transition-all duration-300 ease-in-out',
                    mobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
                  )}
                />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'fixed inset-0 z-50 md:hidden transition-all duration-300 ease-in-out',
            mobileMenuOpen ? 'visible' : 'invisible'
          )}
        >
          {/* Overlay */}
          <div
            className={cn(
              'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out',
              mobileMenuOpen ? 'opacity-100' : 'opacity-0'
            )}
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu overlay"
          />

          {/* Left-side Drawer */}
          <div
            className={cn(
              'absolute top-0 left-0 h-full w-4/5 max-w-sm bg-background shadow-2xl transform transition-transform duration-300 ease-in-out',
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            )}
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
          >
            <div className="flex flex-col h-full">
              {/* Header with close button */}
              <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                    <GraduationCap className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold text-foreground">SAMWAD</span>
                </div>
                <button
                  className="p-2 rounded-lg hover:bg-muted text-foreground transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm shadow-sm">
                    {getInitials(username)}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium text-foreground leading-none">{username}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">ID: {userId}</span>
                  </div>
                </div>

                {/* Campaign Info */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Rocket className="w-4 h-4" />
                    Admin
                  </div>
                  <span className="text-sm font-medium text-foreground truncate max-w-[140px] capitalize">
                    {campaignName}
                  </span>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setRecharge(true);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      'relative flex items-center gap-2 w-full px-4 py-2 rounded-lg font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                      recharge
                        ? 'bg-primary text-primary-foreground'
                        : 'text-secondary-foreground hover:bg-secondary/80'
                    )}
                    aria-label="Show Missed Calls"
                    type="button"
                  >
                    Recharge
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="space-y-1">
                  {navLinks.map((link, index) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'hover:bg-accent hover:translate-x-1'
                        )}
                        style={{
                          transitionDelay: `${index * 50}ms`,
                        }}
                      >
                        <div className="transition-transform duration-200 group-hover:scale-110">{link.icon}</div>
                        {link.name}
                      </Link>
                    );
                  })}
                </div>

                {/* Theme Toggle */}
                <div className="py-3 border-t">
                  <ThemeToggle />
                </div>
              </div>

              {/* Footer with logout */}
              <div className="p-4 border-t bg-muted/30">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200 hover:translate-x-1 group"
                >
                  <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
