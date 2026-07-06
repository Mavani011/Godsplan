import { useState, useEffect, FormEvent } from "react";
import { 
  Compass, 
  MapPin, 
  BookOpen, 
  Coffee, 
  Sparkles, 
  CheckCircle, 
  User, 
  Sliders, 
  Search, 
  Filter, 
  ArrowRight, 
  RefreshCw, 
  Layers, 
  Info, 
  Menu, 
  X, 
  Activity, 
  Volume2, 
  Bell, 
  ChevronRight,
  Map as MapIcon,
  HelpCircle
} from "lucide-react";

// Node Interface matching complex dataset requirements
interface Node {
  id: string;
  name: string;
  category: "culinary" | "academic" | "hidden";
  type: "Cafe" | "Thali" | "PG" | "College" | "Secret Spot" | "Library";
  distance: number; // in km
  secrecy: "Public" | "Unlisted" | "Classified" | "Divine";
  focus: "High" | "Absolute" | "Mellow" | "Intellectual";
  description: string;
  x: number; // 0-100 for interactive map placement
  y: number; // 0-100 for interactive map placement
  details: string;
  rating?: string;
  specialty?: string;
}

// Full rich mock database
const INITIAL_NODES: Node[] = [
  {
    id: "node-01",
    name: "The Void Cafe",
    category: "culinary",
    type: "Cafe",
    distance: 1.2,
    secrecy: "Unlisted",
    focus: "Absolute",
    description: "A raw concrete basement serving single-origin cold brew under singular neon light fixtures. Conversational silence is actively monitored.",
    x: 35,
    y: 42,
    details: "Requires entering via the back alley behind the metal stamping workshop. Order the 'Absolute Noir' extraction.",
    rating: "4.9 // Focus Factor",
    specialty: "Cold Drip (18hr slow gravity brew)"
  },
  {
    id: "node-02",
    name: "Sovereign Thali",
    category: "culinary",
    type: "Thali",
    distance: 0.8,
    secrecy: "Public",
    focus: "High",
    description: "32 small custom-forged bronze bowls displaying rare ancestral grain cultivars and celestial spice profiles. Absolute culinary edge.",
    x: 68,
    y: 25,
    details: "Constructed within a renovated railway arch. The thali formulation changes based on regional humidity levels.",
    rating: "4.8 // Density Factor",
    specialty: "Ancestral Millet and Saffron Medley"
  },
  {
    id: "node-03",
    name: "The Brutalist Cell PG",
    category: "culinary",
    type: "PG",
    distance: 2.1,
    secrecy: "Classified",
    focus: "Mellow",
    description: "Monolithic shared concrete cuboids designed for modern academic ascetics. Includes ultra-fast dark fiber and zero-decibel study modules.",
    x: 20,
    y: 60,
    details: "Underground structural layout. Sound insulated using volcanic aggregate tiles. Biometric security active.",
    rating: "4.7 // Seclusion Rating",
    specialty: "1-Person Cuboid with integrated study terminal"
  },
  {
    id: "node-04",
    name: "Ivy Trajectory Institute",
    category: "academic",
    type: "College",
    distance: 4.5,
    secrecy: "Public",
    focus: "Intellectual",
    description: "A towering obsidian skyscraper teaching experimental computational aesthetics and predictive cosmic pathing.",
    x: 82,
    y: 78,
    details: "The campus is split into physical sky-decks and deep server arrays. Renowned for hyper-rigorous structural design paths.",
    rating: "5.0 // Elite Status",
    specialty: "Pathing Engine Architecture Dept"
  },
  {
    id: "node-05",
    name: "Underground Crypt Lounge",
    category: "hidden",
    type: "Secret Spot",
    distance: 3.4,
    secrecy: "Classified",
    focus: "Mellow",
    description: "An ancient subterranean brick chamber discovered under the abandoned subway spur line. Safe haven for deep thought.",
    x: 48,
    y: 15,
    details: "Enter using the heavy maintenance door on Platform 4. Knock pattern: 3 slow, 2 rapid. Cell signal is entirely dead here.",
    rating: "4.9 // Silence Index",
    specialty: "Sub-harmonic acoustic resonance"
  },
  {
    id: "node-06",
    name: "Glass Theory Library",
    category: "academic",
    type: "Library",
    distance: 1.5,
    secrecy: "Divine",
    focus: "Intellectual",
    description: "A triple-glazed architectural masterpiece housing rare physical codices and silicon storage media from early network eras.",
    x: 52,
    y: 55,
    details: "Floating catwalk design. Glass transparency dynamically adjusts based on the focus score of current occupants.",
    rating: "4.9 // Focus Factor",
    specialty: "Cybernetic History & Ledger Archives"
  },
  {
    id: "node-07",
    name: "Filter Noir",
    category: "culinary",
    type: "Cafe",
    distance: 2.7,
    secrecy: "Public",
    focus: "High",
    description: "Hyper-concentrated South Indian chicory-decoction blends presented at a jet-black brushed steel circular bar.",
    x: 12,
    y: 30,
    details: "No menus, no sugar options, no milk alternatives. A pure double-decoction punch tailored for high-output conductors.",
    rating: "4.6 // Impact",
    specialty: "100% Traditional Chicory Concentrate"
  },
  {
    id: "node-08",
    name: "Oasis Block-B Co-Living",
    category: "culinary",
    type: "PG",
    distance: 1.9,
    secrecy: "Unlisted",
    focus: "Mellow",
    description: "A modern student housing complex designed as an indoor biosphere. Features structural glass ceilings and natural waterfalls.",
    x: 75,
    y: 48,
    details: "Includes shared industrial kitchens, dynamic bento delivery, and access to internal sensory deprivation tanks.",
    rating: "4.8 // Wellness Factor",
    specialty: "Micro-garden Pod with terrace access"
  },
  {
    id: "node-09",
    name: "Primal Plate Thali",
    category: "culinary",
    type: "Thali",
    distance: 3.1,
    secrecy: "Unlisted",
    focus: "High",
    description: "Traditional clay-baked, wood-fired native thali service. Crafted strictly using ingredients farmed within 15km of the city center.",
    x: 90,
    y: 35,
    details: "Tucked behind the historic seed warehouse. Serves only 50 conductors per sun cycle. Advanced reservation required.",
    rating: "4.7 // Quality Rating",
    specialty: "Ancient Wheat Sourdough & Hearth Lentils"
  },
  {
    id: "node-10",
    name: "The Obelisk Observatory",
    category: "hidden",
    type: "Secret Spot",
    distance: 7.8,
    secrecy: "Divine",
    focus: "Absolute",
    description: "An abandoned brick observatory situated on the highest metropolitan ridge. Panoramic view of lower city grid lines.",
    x: 28,
    y: 85,
    details: "The telescope mechanism is locked, but the exterior sky-deck remains fully accessible. Perfect for charting celestial paths.",
    rating: "5.0 // Transcendence",
    specialty: "Horizon perspective alignment"
  },
  {
    id: "node-11",
    name: "Institute of Heavy Materials",
    category: "academic",
    type: "College",
    distance: 5.2,
    secrecy: "Classified",
    focus: "Intellectual",
    description: "Experimental research center dedicated to high-density stone synthesis, physical weight calculations, and architectural integrity.",
    x: 60,
    y: 88,
    details: "Sits on a floating concrete pontoon over the canal basin. Strictly controlled gate clearance.",
    rating: "4.8 // Rigor Scale",
    specialty: "Computational Brutalism & Monolithic Casting"
  },
  {
    id: "node-12",
    name: "The Water Terminal",
    category: "hidden",
    type: "Secret Spot",
    distance: 4.1,
    secrecy: "Unlisted",
    focus: "Mellow",
    description: "A cathedral-like municipal echo chamber where redundant overflow water pipes sing in minor chords. Highly therapeutic.",
    x: 40,
    y: 70,
    details: "Accessible only when local reservoir levels drop below 40%. Extreme negative space acoustics.",
    rating: "4.6 // Spatial Void",
    specialty: "Acoustic drone meditation"
  }
];

// Interactive Notification System Seed
const INITIAL_NOTIFICATIONS = [
  { id: "notif-1", type: "system", title: "CALIBRATION ALIGNED", message: "Your cognitive load has successfully synced with Vault Node 01.", time: "10 mins ago", active: true },
  { id: "notif-2", type: "social", title: "TAGGED IN ARCHIVE", message: "Conductor_77 tagged your profile in Glass Theory Library coordinates.", time: "2 hours ago", active: true },
  { id: "notif-3", type: "recommend", title: "CULINARY NODE AWAKENED", message: "Sovereign Thali adjusted its spice index. Perfect match for your profile.", time: "5 hours ago", active: true },
  { id: "notif-4", type: "system", title: "SECURITY SCAN CLEAR", message: "All local unlisted pathways verified. Secure encryption active.", time: "1 day ago", active: false }
];

export default function App() {
  // Navigation & Screen Control
  const [activeTab, setActiveTab] = useState<"home" | "dashboard" | "discover" | "culinary" | "profile">("home");
  
  // User Profile State
  const [userName, setUserName] = useState("Seeker");
  const [userPursuit, setUserPursuit] = useState<"culinary" | "academic" | "hidden" | "all">("all");
  const [userAesthetic, setUserAesthetic] = useState<"minimalist" | "opulent" | "neon" | "solitude">("minimalist");
  const [userCalibrated, setUserCalibrated] = useState(false);
  
  // Onboarding Wizard step tracker
  const [calibrationStep, setCalibrationStep] = useState(1);
  const [wizardName, setWizardName] = useState("");
  const [wizardPursuit, setWizardPursuit] = useState<"culinary" | "academic" | "hidden" | "all">("all");
  const [wizardAesthetic, setWizardAesthetic] = useState<"minimalist" | "opulent" | "neon" | "solitude">("minimalist");
  const [allocationFocus, setAllocationFocus] = useState(70);
  const [allocationBudget, setAllocationBudget] = useState(50);
  const [allocationSecrecy, setAllocationSecrecy] = useState(80);

  // Form Field Focus State Indicators (requested for basic interactivity)
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isFeedbackFocused, setIsFeedbackFocused] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  // Search, Filter & Layout States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "culinary" | "academic" | "hidden">("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSecrecy, setFilterSecrecy] = useState<string>("all");
  const [filterDistance, setFilterDistance] = useState<number>(10); // Slider state
  const [viewLayout, setViewLayout] = useState<"grid" | "list">("grid");

  // Interaction Modals & Node highlights
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [activeMapNode, setActiveMapNode] = useState<Node | null>(INITIAL_NODES[0]);
  const [shuffledSeed, setShuffledSeed] = useState(1);
  const [isShuffling, setIsShuffling] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [notifFilter, setNotifFilter] = useState<"all" | "system" | "social" | "recommend">("all");
  
  // System Toggle Switches
  const [sysDarkModeOverride, setSysDarkModeOverride] = useState(true);
  const [sysDeepIndexing, setSysDeepIndexing] = useState(true);
  const [sysDirectNotifs, setSysDirectNotifs] = useState(true);

  // Responsive mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sound play simulation state (visual flash)
  const [shuffledFlash, setShuffledFlash] = useState(false);

  // Execute random shuffle action on recommended nodes
  const triggerShuffle = () => {
    setIsShuffling(true);
    setShuffledFlash(true);
    setTimeout(() => {
      setShuffledSeed(Math.floor(Math.random() * 100) + 1);
      setIsShuffling(false);
    }, 800);
    setTimeout(() => setShuffledFlash(false), 1200);
  };

  // Get shuffled recommendations based on state seed and pursuit
  const getRecommendedNodes = () => {
    let base = INITIAL_NODES;
    if (userPursuit !== "all") {
      base = base.filter(n => n.category === userPursuit);
    }
    // Simple stable shuffle based on seed
    const list = [...base];
    for (let i = list.length - 1; i > 0; i--) {
      const j = (i + shuffledSeed) % list.length;
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list.slice(0, 3);
  };

  // Handle initialization submit from landing screen
  const handleLandingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (wizardName.trim() !== "") {
      setUserName(wizardName);
    }
    setUserPursuit(wizardPursuit);
    setUserAesthetic(wizardAesthetic);
    setCalibrationStep(1);
    setActiveTab("profile"); // jump straight to step 1 calibration
  };

  // Save the complete wizard calibration
  const saveCalibration = () => {
    setUserCalibrated(true);
    if (wizardName.trim() !== "") {
      setUserName(wizardName);
    }
    setUserPursuit(wizardPursuit);
    setUserAesthetic(wizardAesthetic);
    
    // Add custom notification
    const newNotif = {
      id: "notif-custom-" + Date.now(),
      type: "system",
      title: "CONDUIT COGNITION CALIBRATED",
      message: `Calibration saved under state: ${wizardAesthetic.toUpperCase()} aesthetic at ${allocationFocus}% focus capacity.`,
      time: "Just now",
      active: true
    };
    setNotifications([newNotif, ...notifications]);
    
    // Auto shift to dashboard to show results
    setActiveTab("dashboard");
  };

  // Filter nodes according to search options
  const getFilteredNodes = () => {
    return INITIAL_NODES.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            node.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "all" || node.category === filterCategory;
      const matchesType = filterType === "all" || node.type === filterType;
      const matchesSecrecy = filterSecrecy === "all" || node.secrecy === filterSecrecy;
      const matchesDistance = node.distance <= filterDistance;
      
      return matchesSearch && matchesCategory && matchesType && matchesSecrecy && matchesDistance;
    });
  };

  // Dismiss single notification
  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Reset calibration
  const resetCalibration = () => {
    setUserCalibrated(false);
    setWizardName(userName);
    setWizardPursuit(userPursuit);
    setWizardAesthetic(userAesthetic);
    setCalibrationStep(1);
  };

  return (
    <div className={`min-h-screen bg-[#0A0A0A] text-[#E5E5E5] flex flex-col font-jakarta transition-colors duration-300 relative overflow-x-hidden ${sysDarkModeOverride ? 'dark' : ''}`}>
      
      {/* Background Graphic Accents (Matches Bold Typography theme) */}
      <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-[#0D0D0D] -z-10 border-l border-white/5 pointer-events-none" />
      <div className="absolute top-[20%] left-[5%] w-[40vw] h-[40vw] bg-radial from-neutral-900/40 to-transparent -z-10 blur-3xl pointer-events-none" />

      {/* Persistent Announcement Ticker */}
      <div className="w-full bg-[#111111] border-b border-white/5 py-2 px-6 flex justify-between items-center text-[10px] uppercase tracking-[0.25em] text-white/50 z-40">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Active Session // Conduit Connection Standard</span>
        </div>
        <div className="hidden md:flex gap-6">
          <span>COGNITIVE CAP: {allocationFocus}%</span>
          <span>AESTHETIC MATRIX: {userAesthetic.toUpperCase()}</span>
          <span>TERRITORY: REGION.01</span>
        </div>
      </div>

      {/* Main Structural Header */}
      <header className="sticky top-0 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/10 py-6 px-6 lg:px-12 z-30 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo / Brand */}
          <div className="flex items-baseline gap-3 cursor-pointer" onClick={() => { setActiveTab("home"); setMobileMenuOpen(false); }}>
            <span className="text-2xl font-black tracking-tighter uppercase italic text-white font-syne hover:scale-[1.01] transition-transform">
              GODSPLAN<span className="text-white/40">.01</span>
            </span>
            <span className="hidden sm:inline-block text-[9px] uppercase tracking-[0.3em] opacity-40 font-bold border-l border-white/20 pl-3">
              CONCIERGE
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-8 items-center text-[10px] uppercase tracking-[0.2em] font-semibold">
            <button 
              id="nav-btn-home"
              onClick={() => setActiveTab("home")}
              className={`py-2 border-b-2 hover:opacity-100 transition-all duration-200 cursor-pointer ${activeTab === "home" ? "border-white text-white opacity-100" : "border-transparent text-white/50 opacity-70"}`}
            >
              Exhibitions // Home
            </button>
            <button 
              id="nav-btn-dashboard"
              onClick={() => setActiveTab("dashboard")}
              className={`py-2 border-b-2 hover:opacity-100 transition-all duration-200 cursor-pointer ${activeTab === "dashboard" ? "border-white text-white opacity-100" : "border-transparent text-white/50 opacity-70"}`}
            >
              Conduit Panel
            </button>
            <button 
              id="nav-btn-discover"
              onClick={() => setActiveTab("discover")}
              className={`py-2 border-b-2 hover:opacity-100 transition-all duration-200 cursor-pointer ${activeTab === "discover" ? "border-white text-white opacity-100" : "border-transparent text-white/50 opacity-70"}`}
            >
              Discovery Engine
            </button>
            <button 
              id="nav-btn-culinary"
              onClick={() => setActiveTab("culinary")}
              className={`py-2 border-b-2 hover:opacity-100 transition-all duration-200 cursor-pointer ${activeTab === "culinary" ? "border-white text-white opacity-100" : "border-transparent text-white/50 opacity-70"}`}
            >
              Culinary Edge
            </button>
            <button 
              id="nav-btn-profile"
              onClick={() => setActiveTab("profile")}
              className={`py-2 border-b-2 hover:opacity-100 transition-all duration-200 cursor-pointer ${activeTab === "profile" ? "border-white text-white opacity-100" : "border-transparent text-white/50 opacity-70"}`}
            >
              Profile & Calibration
            </button>
          </nav>

          {/* Action Badge & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button 
              id="action-btn-calibrate"
              onClick={() => { setActiveTab("profile"); setMobileMenuOpen(false); }}
              className="hidden sm:inline-block text-[10px] uppercase tracking-[0.2em] font-bold bg-white text-black px-5 py-2 cursor-pointer border border-white hover:bg-transparent hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              {userCalibrated ? "Recalibrate Path" : "Calibrate Conduit"}
            </button>
            
            {/* Mobile Menu Icon */}
            <button 
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="lg:hidden p-2 text-white hover:bg-white/5 transition-all cursor-pointer rounded-sm"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[110px] bg-[#0A0A0A] z-50 flex flex-col p-8 border-t border-white/10 justify-between">
          <div className="flex flex-col gap-6 text-sm uppercase tracking-widest font-semibold">
            <button 
              id="mobile-nav-home"
              onClick={() => { setActiveTab("home"); setMobileMenuOpen(false); }} 
              className={`flex items-center justify-between py-3 border-b border-white/5 text-left cursor-pointer ${activeTab === "home" ? "text-white" : "text-white/50"}`}
            >
              <span>Exhibitions // Home</span>
              <ChevronRight size={16} />
            </button>
            <button 
              id="mobile-nav-dashboard"
              onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }} 
              className={`flex items-center justify-between py-3 border-b border-white/5 text-left cursor-pointer ${activeTab === "dashboard" ? "text-white" : "text-white/50"}`}
            >
              <span>Conduit Panel</span>
              <ChevronRight size={16} />
            </button>
            <button 
              id="mobile-nav-discover"
              onClick={() => { setActiveTab("discover"); setMobileMenuOpen(false); }} 
              className={`flex items-center justify-between py-3 border-b border-white/5 text-left cursor-pointer ${activeTab === "discover" ? "text-white" : "text-white/50"}`}
            >
              <span>Discovery Engine</span>
              <ChevronRight size={16} />
            </button>
            <button 
              id="mobile-nav-culinary"
              onClick={() => { setActiveTab("culinary"); setMobileMenuOpen(false); }} 
              className={`flex items-center justify-between py-3 border-b border-white/5 text-left cursor-pointer ${activeTab === "culinary" ? "text-white" : "text-white/50"}`}
            >
              <span>Culinary Edge</span>
              <ChevronRight size={16} />
            </button>
            <button 
              id="mobile-nav-profile"
              onClick={() => { setActiveTab("profile"); setMobileMenuOpen(false); }} 
              className={`flex items-center justify-between py-3 border-b border-white/5 text-left cursor-pointer ${activeTab === "profile" ? "text-white" : "text-white/50"}`}
            >
              <span>Profile & Calibration</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="pb-12">
            <button 
              id="mobile-nav-calibrate-cta"
              onClick={() => { setActiveTab("profile"); setMobileMenuOpen(false); }}
              className="w-full text-center text-xs uppercase tracking-widest font-black bg-white text-black py-4 border border-white hover:bg-black hover:text-white transition-all cursor-pointer"
            >
              {userCalibrated ? "Recalibrate System" : "Begin Verification Process"}
            </button>
            <p className="text-[9px] text-white/30 text-center mt-4 tracking-[0.2em] uppercase">
              COGNITIVE PATHS CALIBRATED REAL-TIME
            </p>
          </div>
        </div>
      )}

      {/* Main Content Sections container with max-width restraint */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 py-8 md:py-16 flex flex-col justify-center relative">
        
        {/* TAB 1: HOME / LANDING SCREEN */}
        {activeTab === "home" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Heavy Typography Brand Showcase */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              
              <div className="flex items-center gap-4">
                <span className="text-[11px] uppercase tracking-[0.4em] text-white/40 block font-space font-bold">
                  Digital Pathing Anthology
                </span>
                <div className="h-[1px] w-24 bg-white/20" />
              </div>

              <div className="space-y-2">
                <h1 className="text-[55px] sm:text-[80px] md:text-[110px] lg:text-[130px] font-black leading-[0.85] tracking-[-0.04em] uppercase m-0 p-0 text-white font-syne select-none">
                  GODSPLAN
                </h1>
                
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <h2 className="text-[55px] sm:text-[80px] md:text-[110px] lg:text-[110px] font-thin leading-[0.85] tracking-[-0.04em] uppercase italic opacity-20 font-syne select-none">
                    CONCIERGE
                  </h2>
                  <div className="max-w-xs">
                    <p className="text-xs sm:text-sm leading-relaxed text-white/60 font-space font-light">
                      A high-precision pathing algorithm exploring the intersection of heavy academic trajectories, secret metropolitan physical nodes, and specialized culinary form.
                    </p>
                  </div>
                </div>
              </div>

              {/* Showcase Grid of Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
                <div 
                  id="pillar-culinary"
                  onClick={() => setActiveTab("culinary")}
                  className="bg-[#111] border border-white/5 p-4 flex flex-col justify-between hover:border-white/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group cursor-pointer"
                >
                  <span className="text-2xl font-black text-white/40 group-hover:text-white transition-colors">01</span>
                  <div className="mt-6">
                    <div className="text-[9px] uppercase tracking-widest font-bold mb-1 font-space">Culinary Edge</div>
                    <div className="h-[2px] w-full bg-white/20 group-hover:bg-white transition-all" />
                  </div>
                </div>

                <div 
                  id="pillar-academic"
                  onClick={() => setActiveTab("discover")}
                  className="bg-[#111] border border-white/5 p-4 flex flex-col justify-between hover:border-white/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group cursor-pointer"
                >
                  <span className="text-2xl font-black text-white/40 group-hover:text-white transition-colors">02</span>
                  <div className="mt-6">
                    <div className="text-[9px] uppercase tracking-widest font-bold mb-1 font-space">Academic Paths</div>
                    <div className="h-[2px] w-full bg-white/20 group-hover:bg-white transition-all" />
                  </div>
                </div>

                <div 
                  id="pillar-hidden"
                  onClick={() => { setFilterCategory("hidden"); setActiveTab("discover"); }}
                  className="bg-[#111] border border-white/5 p-4 flex flex-col justify-between hover:border-white/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group cursor-pointer overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-black opacity-0 group-hover:opacity-20 transition-opacity" />
                  <span className="text-2xl font-black text-white/40 group-hover:text-white transition-colors relative z-10">03</span>
                  <div className="mt-6 relative z-10">
                    <div className="text-[9px] uppercase tracking-widest font-bold mb-1 font-space">Hidden Voids</div>
                    <div className="h-[2px] w-full bg-white/20 group-hover:bg-white transition-all" />
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Custom Interactive Form (Requested) with Highlight on Focus */}
            <div className="lg:col-span-5">
              <div className="bg-[#111] border border-white/10 p-6 md:p-8 relative">
                
                {/* Visual Accent */}
                <div className="absolute -top-[1px] -left-[1px] w-12 h-[1px] bg-white" />
                <div className="absolute -top-[1px] -left-[1px] w-[1px] h-12 bg-white" />

                <div className="mb-6">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-bold block mb-1">
                    Node Interface Connection
                  </span>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white font-syne">
                    Initialize Conduit
                  </h3>
                </div>

                <form onSubmit={handleLandingSubmit} className="space-y-5">
                  
                  {/* Name field (with focus highlights) */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-white/50 mb-2 font-bold">
                      Full Conductor Designation *
                    </label>
                    <div className="relative">
                      <input 
                        id="form-input-name"
                        type="text" 
                        required
                        value={wizardName}
                        onChange={(e) => setWizardName(e.target.value)}
                        placeholder="e.g. Conductor Sterling"
                        onFocus={() => setIsNameFocused(true)}
                        onBlur={() => setIsNameFocused(false)}
                        className={`w-full bg-[#1A1A1A] text-white text-xs px-4 py-3 border transition-all duration-300 focus:outline-none font-space font-medium placeholder:text-neutral-600 ${
                          isNameFocused ? "border-white ring-1 ring-white bg-[#222]" : "border-white/10 hover:border-white/30"
                        }`}
                      />
                      <span className={`absolute right-3 top-3.5 w-1.5 h-1.5 rounded-full transition-all ${isNameFocused ? 'bg-white scale-125' : 'bg-white/10'}`} />
                    </div>
                    <p className="text-[9px] text-white/30 mt-1 uppercase tracking-wider">
                      This label logs your aesthetic preferences into the local state.
                    </p>
                  </div>

                  {/* Primary pursuit field (brutalist selection) */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-white/50 mb-2 font-bold">
                      Cognitive Path Affinity
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        id="pursuit-opt-culinary"
                        onClick={() => setWizardPursuit("culinary")}
                        className={`px-3 py-2 text-[10px] uppercase font-bold tracking-wider border text-center transition-all cursor-pointer ${
                          wizardPursuit === "culinary" 
                            ? "bg-white text-black border-white" 
                            : "bg-transparent text-white/60 border-white/15 hover:border-white/40 hover:text-white"
                        }`}
                      >
                        Culinary Edge
                      </button>
                      <button
                        type="button"
                        id="pursuit-opt-academic"
                        onClick={() => setWizardPursuit("academic")}
                        className={`px-3 py-2 text-[10px] uppercase font-bold tracking-wider border text-center transition-all cursor-pointer ${
                          wizardPursuit === "academic" 
                            ? "bg-white text-black border-white" 
                            : "bg-transparent text-white/60 border-white/15 hover:border-white/40 hover:text-white"
                        }`}
                      >
                        Academic trajectory
                      </button>
                      <button
                        type="button"
                        id="pursuit-opt-hidden"
                        onClick={() => setWizardPursuit("hidden")}
                        className={`px-3 py-2 text-[10px] uppercase font-bold tracking-wider border text-center transition-all cursor-pointer ${
                          wizardPursuit === "hidden" 
                            ? "bg-white text-black border-white" 
                            : "bg-transparent text-white/60 border-white/15 hover:border-white/40 hover:text-white"
                        }`}
                      >
                        Secret Voids
                      </button>
                      <button
                        type="button"
                        id="pursuit-opt-all"
                        onClick={() => setWizardPursuit("all")}
                        className={`px-3 py-2 text-[10px] uppercase font-bold tracking-wider border text-center transition-all cursor-pointer ${
                          wizardPursuit === "all" 
                            ? "bg-white text-black border-white" 
                            : "bg-transparent text-white/60 border-white/15 hover:border-white/40 hover:text-white"
                        }`}
                      >
                        All Portals [Omni]
                      </button>
                    </div>
                  </div>

                  {/* Aesthetic core selection */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-white/50 mb-2 font-bold">
                      Aesthetic Core Preset
                    </label>
                    <select
                      id="form-select-aesthetic"
                      value={wizardAesthetic}
                      onChange={(e) => setWizardAesthetic(e.target.value as any)}
                      className="w-full bg-[#1A1A1A] text-white text-xs px-4 py-3 border border-white/10 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all font-space"
                    >
                      <option value="minimalist">Minimalist Brutalism [Raw Concrete]</option>
                      <option value="opulent">Gilded Opulence [Gold & Ivory]</option>
                      <option value="neon">Neo-Tokyo Neon [Chrome & Laser]</option>
                      <option value="solitude">Cosmic Solitude [Deep Velvet Black]</option>
                    </select>
                  </div>

                  {/* Interactive Button that changes color when hovered over */}
                  <button
                    type="submit"
                    id="submit-landing-form"
                    className="w-full mt-2 bg-white text-black hover:bg-neutral-900 hover:text-white border-2 border-white py-4 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <span>Transcend Now</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                </form>

                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] text-white/40 tracking-wider">
                  <span>REGISTRATION PROTOCOL V.89</span>
                  <span>98.4% MATCH RATE</span>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: CONDUIT PANEL (DASHBOARD) */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Dashboard Header Banner */}
            <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
              <div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 mb-1 font-bold">
                  <Activity size={12} className="text-white/60 animate-pulse" />
                  <span>Interactive Real-time Hub</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black uppercase font-syne tracking-tight">
                  Conductor: <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">{userName.toUpperCase()}</span>
                </h2>
              </div>

              {/* Quick statistics layout */}
              <div className="flex gap-6 text-[10px] uppercase tracking-[0.2em] font-semibold border-t md:border-t-0 pt-4 md:pt-0 border-white/10">
                <div>
                  <span className="opacity-40 block">Cognitive Cap</span>
                  <span className="text-white font-bold text-sm">{allocationFocus}%</span>
                </div>
                <div>
                  <span className="opacity-40 block">Region Search</span>
                  <span className="text-white font-bold text-sm">Active</span>
                </div>
                <div>
                  <span className="opacity-40 block">Integrity Matrix</span>
                  <span className="text-white font-bold text-sm">94%</span>
                </div>
              </div>
            </div>

            {/* Dashboard Grid Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Recommendations Cards + Shuffle Mechanism */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                <div className="flex justify-between items-center">
                  <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-white/60 flex items-center gap-2">
                    <Sparkles size={14} />
                    <span>Selected Nodes for You</span>
                  </h3>
                  
                  {/* Interactive Shuffle Deck with loading states */}
                  <button
                    id="shuffle-btn"
                    onClick={triggerShuffle}
                    disabled={isShuffling}
                    className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold border border-white/20 bg-[#111] px-3 py-1.5 text-white/80 hover:bg-white hover:text-black hover:border-white transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={10} className={`${isShuffling ? 'animate-spin' : ''}`} />
                    <span>Shuffle Deck</span>
                  </button>
                </div>

                {/* Shuffling Loading Indicator / Card Container */}
                <div className="space-y-4 relative min-h-[300px]">
                  
                  {isShuffling && (
                    <div className="absolute inset-0 bg-black/80 z-20 flex flex-col justify-center items-center border border-white/10 backdrop-blur-xs">
                      <RefreshCw size={24} className="animate-spin text-white mb-2" />
                      <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-white">Re-indexing Terrain Nodes...</span>
                    </div>
                  )}

                  {getRecommendedNodes().map((node, idx) => (
                    <div 
                      key={node.id} 
                      id={`rec-node-${node.id}`}
                      onClick={() => { setActiveMapNode(node); setSelectedNode(node); }}
                      className={`bg-[#111] border p-5 flex flex-col justify-between hover:border-white/50 transition-all cursor-pointer group hover:scale-[1.01] ${
                        activeMapNode?.id === node.id ? 'border-white bg-[#1a1a1a]' : 'border-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[9px] uppercase tracking-widest bg-white/10 text-white/80 px-2 py-0.5 font-semibold font-space">
                          {node.type}
                        </span>
                        <span className="text-[10px] font-mono text-white/40">
                          0{idx + 1}
                        </span>
                      </div>

                      <div className="mt-4 mb-4">
                        <h4 className="text-base font-bold uppercase tracking-tight text-white group-hover:text-white transition-colors">
                          {node.name}
                        </h4>
                        <p className="text-xs text-white/50 line-clamp-2 mt-1 font-space">
                          {node.description}
                        </p>
                      </div>

                      <div className="border-t border-white/5 pt-3 flex justify-between items-center text-[10px]">
                        <span className="text-white/40 uppercase tracking-widest">Distance</span>
                        <span className="font-bold text-white">{node.distance} KM</span>
                      </div>
                    </div>
                  ))}

                  {getRecommendedNodes().length === 0 && (
                    <div className="bg-[#111] border border-white/5 p-8 text-center text-white/40">
                      <Info size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs uppercase tracking-wider">No matching aligned nodes.</p>
                      <button onClick={resetCalibration} className="text-[9px] uppercase underline mt-2 text-white block mx-auto">
                        Reset Pursuit Filters
                      </button>
                    </div>
                  )}

                </div>

              </div>

              {/* Middle Column: Interactive Coordinates Map Canvas (Requested Layout) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                
                <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-white/60 flex items-center gap-2">
                  <MapIcon size={14} />
                  <span>Acoustic Grid Coordinates</span>
                </h3>

                {/* Grid Visualizer Map */}
                <div className="bg-[#111] border border-white/10 p-4 aspect-square flex flex-col justify-between relative overflow-hidden select-none">
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-10 pointer-events-none">
                    {Array.from({ length: 100 }).map((_, i) => (
                      <div key={i} className="border-t border-l border-white" />
                    ))}
                  </div>

                  {/* Map Graphic Accents */}
                  <div className="absolute top-4 right-4 text-[9px] font-mono text-white/30 tracking-widest">
                    SYSTEM_SYS_X.991
                  </div>
                  
                  {/* Simulated Location Nodes on Grid */}
                  <div className="absolute inset-0">
                    {INITIAL_NODES.map(node => {
                      const isSelected = activeMapNode?.id === node.id;
                      return (
                        <button
                          key={node.id}
                          id={`map-pin-${node.id}`}
                          onClick={() => { setActiveMapNode(node); setSelectedNode(node); }}
                          style={{ left: `${node.x}%`, top: `${node.y}%` }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 focus:outline-none cursor-pointer group z-10`}
                          title={node.name}
                        >
                          {/* Inner pulse indicator */}
                          <span className={`relative flex h-3 w-3`}>
                            {isSelected && (
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-3 w-3 border transition-all ${
                              isSelected 
                                ? 'bg-white border-white scale-125' 
                                : 'bg-transparent border-white/50 group-hover:bg-white group-hover:scale-110'
                            }`} />
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Corner Labels (Brutalist framing) */}
                  <div className="flex justify-between text-[8px] text-white/20 uppercase font-mono relative z-0">
                    <span>GRID_SEC_A</span>
                    <span>GRID_SEC_B</span>
                  </div>

                  {/* Center Target Indicator */}
                  <div className="self-center flex flex-col items-center pointer-events-none relative z-0">
                    <div className="w-12 h-12 border border-dashed border-white/20 rounded-full flex items-center justify-center animate-spin-slow">
                      <div className="w-1 h-1 bg-white" />
                    </div>
                  </div>

                  <div className="flex justify-between items-end relative z-0">
                    <div className="text-[8px] text-white/20 uppercase font-mono">
                      <span>GRID_SEC_C</span>
                    </div>
                    
                    {/* Compass Overlay Panel */}
                    <div className="bg-black/80 border border-white/10 px-3 py-1 text-[8px] font-mono text-white/80">
                      SYS_LAT: {activeMapNode ? (52.5200 + activeMapNode.x / 1000).toFixed(4) : "52.5200"}° N <br />
                      SYS_LNG: {activeMapNode ? (13.4050 + activeMapNode.y / 1000).toFixed(4) : "13.4050"}° E
                    </div>

                    <div className="text-[8px] text-white/20 uppercase font-mono">
                      <span>GRID_SEC_D</span>
                    </div>
                  </div>

                </div>

                {/* Selected Node Mini Panel */}
                {activeMapNode && (
                  <div className="bg-[#1A1A1A] border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-1">
                        Active Crosshair Coordinate
                      </div>
                      <h4 className="text-sm font-bold uppercase tracking-tight text-white flex items-center gap-2">
                        <span>{activeMapNode.name}</span>
                        <span className="text-[10px] font-normal text-white/50 lowercase italic">
                          ({activeMapNode.type})
                        </span>
                      </h4>
                      <p className="text-[11px] text-white/60 mt-0.5 line-clamp-1 font-space">
                        {activeMapNode.description}
                      </p>
                    </div>

                    <button
                      id="map-detail-btn"
                      onClick={() => setSelectedNode(activeMapNode)}
                      className="text-[9px] uppercase tracking-wider font-bold bg-white text-black px-4 py-2 hover:bg-neutral-900 hover:text-white border border-white transition-all cursor-pointer whitespace-nowrap"
                    >
                      Examine Node
                    </button>
                  </div>
                )}

              </div>

              {/* Right Column: Focus Analytics & Interaction Logs */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Custom Analytical Radar simulation with Brutalist bars */}
                <div className="bg-[#111] border border-white/10 p-5">
                  <h3 className="text-xs uppercase tracking-[0.25em] font-black text-white/80 border-b border-white/10 pb-3 mb-4 flex items-center gap-2 font-syne">
                    <Sliders size={12} />
                    <span>Resource Load</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1">
                        <span className="opacity-60">Cognitive Focus</span>
                        <span className="font-bold">{allocationFocus}%</span>
                      </div>
                      <div className="w-full h-[6px] bg-white/10">
                        <div className="h-full bg-white transition-all duration-500" style={{ width: `${allocationFocus}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1">
                        <span className="opacity-60">Capital Output</span>
                        <span className="font-bold">{allocationBudget}%</span>
                      </div>
                      <div className="w-full h-[6px] bg-white/10">
                        <div className="h-full bg-white/60 transition-all duration-500" style={{ width: `${allocationBudget}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1">
                        <span className="opacity-60">Absolute Secrecy</span>
                        <span className="font-bold">{allocationSecrecy}%</span>
                      </div>
                      <div className="w-full h-[6px] bg-white/10">
                        <div className="h-full bg-white/30 transition-all duration-500" style={{ width: `${allocationSecrecy}%` }} />
                      </div>
                    </div>
                  </div>

                  <p className="text-[9px] text-white/30 mt-5 leading-relaxed uppercase tracking-wider">
                    Metrics calibrated using active thali consumption rates and travel matrices.
                  </p>
                </div>

                {/* Notifications & Log Streams with Interactive Pin/Dismiss */}
                <div className="bg-[#111] border border-white/10 p-5">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                    <h3 className="text-xs uppercase tracking-[0.25em] font-black text-white/80 flex items-center gap-2 font-syne">
                      <Bell size={12} />
                      <span>Log Streams</span>
                    </h3>
                    <span className="text-[9px] font-mono bg-white/10 text-white/80 px-1.5 py-0.5 font-bold">
                      {notifications.length}
                    </span>
                  </div>

                  {/* Stream Filter Switches */}
                  <div className="flex gap-2 mb-4 text-[8px] uppercase tracking-wider">
                    <button 
                      onClick={() => setNotifFilter("all")} 
                      className={`px-2 py-0.5 border cursor-pointer ${notifFilter === "all" ? 'bg-white text-black border-white' : 'border-white/10 text-white/50'}`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setNotifFilter("system")} 
                      className={`px-2 py-0.5 border cursor-pointer ${notifFilter === "system" ? 'bg-white text-black border-white' : 'border-white/10 text-white/50'}`}
                    >
                      Sys
                    </button>
                    <button 
                      onClick={() => setNotifFilter("social")} 
                      className={`px-2 py-0.5 border cursor-pointer ${notifFilter === "social" ? 'bg-white text-black border-white' : 'border-white/10 text-white/50'}`}
                    >
                      Social
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                    {notifications
                      .filter(n => notifFilter === "all" || n.type === notifFilter)
                      .map(notif => (
                        <div key={notif.id} className="text-[10px] border-b border-white/5 pb-2 last:border-0 group relative">
                          <div className="flex justify-between items-start">
                            <span className={`font-bold uppercase tracking-wider ${notif.type === 'system' ? 'text-white' : 'text-white/60'}`}>
                              {notif.title}
                            </span>
                            
                            {/* Interactive Dismiss Button */}
                            <button
                              onClick={() => dismissNotification(notif.id)}
                              className="opacity-0 group-hover:opacity-100 text-[8px] uppercase tracking-widest text-neutral-500 hover:text-white cursor-pointer transition-opacity"
                              title="Dismiss Alert"
                            >
                              Dismiss
                            </button>
                          </div>
                          <p className="text-white/60 mt-0.5 font-space leading-snug">{notif.message}</p>
                          <span className="text-[8px] text-white/30 block mt-1 font-mono">{notif.time}</span>
                        </div>
                      ))}

                    {notifications.length === 0 && (
                      <p className="text-[9px] text-white/40 text-center uppercase py-4">Logs cleared.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 3: DISCOVERY ENGINE */}
        {activeTab === "discover" && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Page Header */}
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 block font-bold mb-1">
                Advanced Vault Searching
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight font-syne text-white">
                Discovery Engine
              </h2>
            </div>

            {/* Integrated Controls (Interactive Search + Filter Bar) */}
            <div className="bg-[#111] border border-white/10 p-5 md:p-6 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Search Bar - focused state changes border highlights */}
                <div className="md:col-span-6 relative">
                  <Search size={16} className={`absolute left-3.5 top-3.5 transition-colors ${isSearchFocused ? 'text-white' : 'text-white/30'}`} />
                  <input
                    id="search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Search coordinates, nodes, types..."
                    className={`w-full bg-[#1A1A1A] text-white text-xs pl-11 pr-4 py-3.5 border transition-all duration-300 focus:outline-none font-space font-medium placeholder:text-neutral-600 ${
                      isSearchFocused ? "border-white ring-1 ring-white" : "border-white/15"
                    }`}
                  />
                </div>

                {/* Category Filters */}
                <div className="md:col-span-3">
                  <select
                    id="filter-category-select"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as any)}
                    className="w-full bg-[#1A1A1A] text-white text-xs px-4 py-3.5 border border-white/15 focus:outline-none focus:border-white transition-all font-space"
                  >
                    <option value="all">All Portal Categories</option>
                    <option value="culinary">Culinary Edges Only</option>
                    <option value="academic">Academic Trajectories Only</option>
                    <option value="hidden">Hidden Voids Only</option>
                  </select>
                </div>

                {/* Secrecy Levels Selector */}
                <div className="md:col-span-3">
                  <select
                    id="filter-secrecy-select"
                    value={filterSecrecy}
                    onChange={(e) => setFilterSecrecy(e.target.value)}
                    className="w-full bg-[#1A1A1A] text-white text-xs px-4 py-3.5 border border-white/15 focus:outline-none focus:border-white transition-all font-space"
                  >
                    <option value="all">All Clearance Security</option>
                    <option value="Public">Public Access</option>
                    <option value="Unlisted">Unlisted Nodes</option>
                    <option value="Classified">Classified</option>
                    <option value="Divine">Divine Seclusion</option>
                  </select>
                </div>

              </div>

              {/* Advanced Slider Filtering Options */}
              <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Distance Filter Slider (Highly interactive!) */}
                <div className="flex-1 max-w-md">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/50 mb-1.5 font-bold font-space">
                    <span>Radius Threshold</span>
                    <span className="text-white">{filterDistance.toFixed(1)} KM</span>
                  </div>
                  <input
                    id="distance-slider"
                    type="range"
                    min="0.5"
                    max="10.0"
                    step="0.1"
                    value={filterDistance}
                    onChange={(e) => setFilterDistance(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/10 appearance-none cursor-pointer accent-white focus:outline-none"
                  />
                  <div className="flex justify-between text-[8px] text-white/30 font-mono mt-1">
                    <span>0.5 KM</span>
                    <span>5.0 KM</span>
                    <span>10.0 KM [Max Range]</span>
                  </div>
                </div>

                {/* Grid Layout Toggles */}
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider font-semibold">
                  <span className="opacity-40">View Layout</span>
                  <div className="flex border border-white/20">
                    <button
                      id="layout-grid-btn"
                      onClick={() => setViewLayout("grid")}
                      className={`px-3 py-1 cursor-pointer ${viewLayout === "grid" ? "bg-white text-black font-bold" : "text-white/60 hover:text-white"}`}
                    >
                      Grid
                    </button>
                    <button
                      id="layout-list-btn"
                      onClick={() => setViewLayout("list")}
                      className={`px-3 py-1 cursor-pointer ${viewLayout === "list" ? "bg-white text-black font-bold" : "text-white/60 hover:text-white"}`}
                    >
                      List
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Results Grid / List Section */}
            <div>
              <div className="flex justify-between items-baseline mb-4 text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold font-space">
                <span>Displaying Calibration Query Results</span>
                <span>{getFilteredNodes().length} Nodes Aligned</span>
              </div>

              {getFilteredNodes().length > 0 ? (
                viewLayout === "grid" ? (
                  // Grid View layout
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredNodes().map(node => (
                      <div
                        key={node.id}
                        id={`discover-card-${node.id}`}
                        onClick={() => setSelectedNode(node)}
                        className="bg-[#111] border border-white/10 p-6 flex flex-col justify-between hover:border-white/50 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 group cursor-pointer"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[9px] uppercase tracking-widest text-white/40 border border-white/20 px-2.5 py-0.5 font-bold">
                              {node.type}
                            </span>
                            <span className="text-[9px] uppercase tracking-[0.15em] bg-white text-black px-1.5 py-0.5 font-black">
                              {node.secrecy}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold uppercase tracking-tight text-white mb-2 font-syne">
                            {node.name}
                          </h3>
                          <p className="text-xs text-white/60 leading-relaxed font-space line-clamp-3">
                            {node.description}
                          </p>
                        </div>

                        <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-[10px] font-space uppercase">
                          <div>
                            <span className="opacity-40 block text-[8px]">Distance</span>
                            <span className="text-white font-bold">{node.distance} KM</span>
                          </div>
                          <div>
                            <span className="opacity-40 block text-[8px]">Focus Threshold</span>
                            <span className="text-white font-bold">{node.focus}</span>
                          </div>
                          <span className="text-white/40 group-hover:text-white font-black text-xs transition-colors">
                            EXAMINE // ➔
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // List View layout
                  <div className="border border-white/10 divide-y divide-white/5 bg-[#111]">
                    {getFilteredNodes().map(node => (
                      <div
                        key={node.id}
                        id={`discover-list-${node.id}`}
                        onClick={() => setSelectedNode(node)}
                        className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/5 transition-all cursor-pointer group"
                      >
                        <div className="max-w-2xl">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-[8px] uppercase tracking-widest bg-white/10 px-2 py-0.5 text-white/80">
                              {node.type}
                            </span>
                            <span className="text-[8px] font-mono opacity-40">
                              SEC_LEVEL: {node.secrecy.toUpperCase()}
                            </span>
                          </div>
                          <h3 className="text-base font-bold uppercase text-white group-hover:text-white font-syne">
                            {node.name}
                          </h3>
                          <p className="text-xs text-white/50 line-clamp-1 mt-0.5 font-space">
                            {node.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-8 text-[11px] font-space uppercase tracking-wider text-right self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                          <div className="text-left md:text-right">
                            <span className="opacity-30 block text-[8px]">Distance</span>
                            <span className="font-bold">{node.distance} KM</span>
                          </div>
                          <div className="text-left md:text-right hidden sm:block">
                            <span className="opacity-30 block text-[8px]">Density</span>
                            <span className="font-bold">{node.focus}</span>
                          </div>
                          <span className="text-white bg-white/10 hover:bg-white hover:text-black border border-white/10 px-3 py-1 text-[9px] uppercase font-bold transition-all">
                            Examine
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                // Empty search result simulator
                <div className="bg-[#111] border border-white/10 p-12 text-center max-w-md mx-auto">
                  <Layers size={36} className="mx-auto mb-4 opacity-30 text-white" />
                  <h3 className="text-base font-bold uppercase mb-2">No Coordinates Aligned</h3>
                  <p className="text-xs text-white/50 leading-relaxed mb-6 font-space">
                    Your current search configuration matched zero physical nodes. Adjust the distance threshold or query filters.
                  </p>
                  <button
                    id="reset-search-btn"
                    onClick={() => { setSearchQuery(""); setFilterCategory("all"); setFilterSecrecy("all"); setFilterDistance(10); }}
                    className="text-xs uppercase tracking-wider font-bold bg-white text-black px-6 py-3 border border-white hover:bg-transparent hover:text-white transition-all cursor-pointer"
                  >
                    Reset Aligned Queries
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: CULINARY EDGE PORTAL */}
        {activeTab === "culinary" && (
          <div className="space-y-10 animate-fade-in">
            
            {/* Visual Header Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
              <div className="lg:col-span-8">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 block font-bold mb-1">
                  Gastronomy & Co-Living Anchors
                </span>
                <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tight font-syne text-white">
                  Culinary Edge
                </h2>
              </div>
              
              {/* Dynamic slider summary */}
              <div className="lg:col-span-4 bg-[#111] border border-white/10 px-4 py-3 flex justify-between items-center text-[10px] uppercase font-bold font-space">
                <span className="opacity-40">Local Radius Threshold</span>
                <span className="text-white border border-white/20 px-2 py-0.5">{filterDistance.toFixed(1)} KM</span>
              </div>
            </div>

            {/* Slider Filter integration */}
            <div className="bg-[#111] border border-white/10 p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-[10px] uppercase tracking-widest font-black text-white/50 mb-1 font-space">
                    Interactive Proximity Slider Filter
                  </h3>
                  <p className="text-xs text-white/40 font-space font-light mb-3">
                    Drag the threshold to narrow down high-aesthetic PG student residences, thali matrices, and cafes.
                  </p>
                  <input
                    id="culinary-range-slider"
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.1"
                    value={filterDistance}
                    onChange={(e) => setFilterDistance(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/10 appearance-none cursor-pointer accent-white focus:outline-none"
                  />
                  <div className="flex justify-between text-[8px] text-white/30 font-mono mt-1">
                    <span>0.5 KM (Immediate Proximity)</span>
                    <span>3.0 KM</span>
                    <span>6.0 KM (Extended Territory)</span>
                  </div>
                </div>

                {/* Specialty Buttons for Quick Sorting */}
                <div className="flex flex-wrap gap-2">
                  <button
                    id="culinary-sort-all"
                    onClick={() => { setFilterType("all"); setFilterCategory("culinary"); }}
                    className={`px-3 py-2 text-[9px] uppercase tracking-widest font-bold border cursor-pointer ${filterType === "all" ? 'bg-white text-black border-white' : 'border-white/10 text-white/60 hover:text-white hover:border-white/30'}`}
                  >
                    All Culinary Nodes
                  </button>
                  <button
                    id="culinary-sort-cafes"
                    onClick={() => { setFilterType("Cafe"); setFilterCategory("culinary"); }}
                    className={`px-3 py-2 text-[9px] uppercase tracking-widest font-bold border cursor-pointer ${filterType === "Cafe" ? 'bg-white text-black border-white' : 'border-white/10 text-white/60 hover:text-white hover:border-white/30'}`}
                  >
                    Specialty Cafes
                  </button>
                  <button
                    id="culinary-sort-thalis"
                    onClick={() => { setFilterType("Thali"); setFilterCategory("culinary"); }}
                    className={`px-3 py-2 text-[9px] uppercase tracking-widest font-bold border cursor-pointer ${filterType === "Thali" ? 'bg-white text-black border-white' : 'border-white/10 text-white/60 hover:text-white hover:border-white/30'}`}
                  >
                    Sovereign Thalis
                  </button>
                  <button
                    id="culinary-sort-pgs"
                    onClick={() => { setFilterType("PG"); setFilterCategory("culinary"); }}
                    className={`px-3 py-2 text-[9px] uppercase tracking-widest font-bold border cursor-pointer ${filterType === "PG" ? 'bg-white text-black border-white' : 'border-white/10 text-white/60 hover:text-white hover:border-white/30'}`}
                  >
                    Student Residences (PG)
                  </button>
                </div>
              </div>
            </div>

            {/* Curated Grid Display */}
            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-[0.25em] font-black text-white/50 border-b border-white/5 pb-2">
                Aligned Node Offerings Within Range
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {INITIAL_NODES
                  .filter(n => n.category === "culinary" && (filterType === "all" || n.type === filterType) && n.distance <= filterDistance)
                  .map(node => (
                    <div
                      key={node.id}
                      id={`culinary-card-${node.id}`}
                      onClick={() => setSelectedNode(node)}
                      className="bg-[#111] border border-white/10 p-6 flex flex-col md:flex-row justify-between gap-6 hover:border-white/40 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer group"
                    >
                      {/* Left Block */}
                      <div className="flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex gap-2 items-center mb-1 text-[9px] uppercase tracking-wider text-white/40">
                            <Coffee size={12} className="text-white" />
                            <span>{node.type} Node // {node.secrecy}</span>
                          </div>
                          <h4 className="text-lg font-bold uppercase text-white font-syne tracking-tight group-hover:text-white">
                            {node.name}
                          </h4>
                          <p className="text-xs text-white/60 leading-relaxed font-space mt-1.5">
                            {node.description}
                          </p>
                        </div>

                        {/* Specialty highlight info */}
                        {node.specialty && (
                          <div className="bg-[#1A1A1A] border-l-2 border-white px-3 py-2 text-[10px] font-mono text-white/80">
                            <span className="opacity-40 block uppercase text-[8px] tracking-wider mb-0.5">Signature Formula</span>
                            {node.specialty}
                          </div>
                        )}
                      </div>

                      {/* Right Block for Stats / Distance */}
                      <div className="flex md:flex-col justify-between md:justify-center items-end text-right md:w-32 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 self-stretch md:self-auto shrink-0">
                        <div className="text-left md:text-right">
                          <span className="opacity-40 block text-[8px] uppercase tracking-wider">Metres Away</span>
                          <span className="text-xl font-black text-white font-space">{(node.distance * 1000).toFixed(0)}m</span>
                        </div>
                        
                        <div className="mt-4 text-left md:text-right">
                          <span className="opacity-40 block text-[8px] uppercase tracking-wider">Index Score</span>
                          <span className="text-xs font-bold text-white font-mono">{node.rating}</span>
                        </div>

                        <span className="mt-4 hidden md:block text-[9px] uppercase tracking-widest font-bold text-white border border-white/20 group-hover:bg-white group-hover:text-black group-hover:border-white px-3 py-1.5 transition-all">
                          Examine
                        </span>
                      </div>

                    </div>
                  ))}

                {INITIAL_NODES.filter(n => n.category === "culinary" && (filterType === "all" || n.type === filterType) && n.distance <= filterDistance).length === 0 && (
                  <div className="col-span-1 md:col-span-2 bg-[#111] border border-white/10 p-12 text-center">
                    <Coffee size={32} className="mx-auto text-white/30 mb-3" />
                    <h4 className="text-base font-bold uppercase mb-1">Out of Spatial Range</h4>
                    <p className="text-xs text-white/50 font-space leading-relaxed max-w-sm mx-auto">
                      No matching culinary nodes were detected inside your specified radius matrix. Drag the Proximity Slider filter to expand the physical coverage area.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: PROFILE & STATE CALIBRATION */}
        {activeTab === "profile" && (
          <div className="space-y-10 animate-fade-in">
            
            {/* Header */}
            <div className="border-b border-white/10 pb-6">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 block font-bold mb-1">
                Conduit Calibration & Preference Controls
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight font-syne text-white">
                Profile Calibration
              </h2>
            </div>

            {/* Profile Workspace Layout (Responsive columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Calibration Wizard Form (Requested 3-Step Wizard) */}
              <div className="lg:col-span-7 bg-[#111] border border-white/10 p-6 md:p-8 relative">
                
                {/* corner design */}
                <div className="absolute top-0 right-0 w-8 h-[1px] bg-white" />
                <div className="absolute top-0 right-0 w-[1px] h-8 bg-white" />

                <div className="flex justify-between items-baseline mb-6 pb-4 border-b border-white/5">
                  <div>
                    <span className="text-[8px] font-mono text-white/40 uppercase block">Cognitive Matrix Setup</span>
                    <h3 className="text-lg font-bold uppercase tracking-tight text-white font-syne">
                      Preference Calibration Wizard
                    </h3>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider font-bold">
                    Step {calibrationStep} of 3
                  </div>
                </div>

                {/* Progress bar visual indicator */}
                <div className="w-full h-1 bg-white/10 mb-8 flex">
                  <div className={`h-full bg-white transition-all duration-300 ${calibrationStep >= 1 ? 'w-1/3' : 'w-0'}`} />
                  <div className={`h-full bg-white/60 transition-all duration-300 ${calibrationStep >= 2 ? 'w-1/3' : 'w-0'}`} />
                  <div className={`h-full bg-white/20 transition-all duration-300 ${calibrationStep >= 3 ? 'w-1/3' : 'w-0'}`} />
                </div>

                {/* STEP 1: DEFINE YOUR TERRITORY */}
                {calibrationStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs uppercase tracking-widest font-bold text-white/80 mb-2">
                        Step 1: Define Designation & Pursuits
                      </h4>
                      <p className="text-xs text-white/50 font-space leading-relaxed mb-6">
                        Provide your calibration handle and toggle your key portal interest affinity fields.
                      </p>
                    </div>

                    {/* Interactive Input with high contrast highlight (requested) */}
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.2em] text-white/50 mb-2 font-bold font-space">
                        Conductor Identity Handle
                      </label>
                      <input 
                        id="wizard-name-input"
                        type="text"
                        value={wizardName}
                        onChange={(e) => setWizardName(e.target.value)}
                        onFocus={() => setIsNameFocused(true)}
                        onBlur={() => setIsNameFocused(false)}
                        placeholder="Your title..."
                        className={`w-full bg-[#1A1A1A] text-white text-xs px-4 py-3 border transition-all duration-300 focus:outline-none font-space font-semibold ${
                          isNameFocused ? "border-white ring-1 ring-white" : "border-white/15"
                        }`}
                      />
                    </div>

                    {/* Multi selection buttons */}
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.2em] text-white/50 mb-2 font-bold font-space">
                        Select Core Path Affinity
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { key: "culinary", title: "Culinary Edge Focus", desc: "Access to hidden cafes, student PGs, and special local thalis." },
                          { key: "academic", title: "Academic Trajectory", desc: "Access to library grids, universities, and architectural vaults." },
                          { key: "hidden", title: "Hidden Voids Spotting", desc: "Access to private observation decks and classified city structures." },
                          { key: "all", title: "Omni Portal Access", desc: "Calibrate alignment matrices across all sectors simultaneously." }
                        ].map(item => (
                          <button
                            key={item.key}
                            type="button"
                            id={`wiz-pursuit-${item.key}`}
                            onClick={() => setWizardPursuit(item.key as any)}
                            className={`p-3 border text-left cursor-pointer transition-all ${
                              wizardPursuit === item.key 
                                ? "bg-white text-black border-white" 
                                : "bg-transparent text-white/80 border-white/10 hover:border-white/30"
                            }`}
                          >
                            <span className="block text-[10px] font-black uppercase tracking-wider">{item.title}</span>
                            <span className="block text-[8px] opacity-70 mt-1 font-space lowercase leading-tight">{item.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-end">
                      <button
                        id="wizard-next-1"
                        onClick={() => setCalibrationStep(2)}
                        className="bg-white text-black hover:bg-neutral-900 hover:text-white border border-white px-6 py-3 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Next Matrix Phase</span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: REFINE YOUR AESTHETIC */}
                {calibrationStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs uppercase tracking-widest font-bold text-white/80 mb-2">
                        Step 2: Refine Your Aesthetic Form
                      </h4>
                      <p className="text-xs text-white/50 font-space leading-relaxed mb-6">
                        Select a sensory preset designed to adjust global layout color saturation and font pairings.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: "minimalist", name: "Minimalist Brutalism", desc: "Heavy raw concrete aggregate. High negative space, solid framing rules." },
                        { key: "opulent", name: "Gilded Opulence", desc: "Gold trim accents, delicate light layouts, luxury visual assets." },
                        { key: "neon", name: "Neo-Tokyo Laser", desc: "High contrast chrome, fluorescent wireframes, glowing overlays." },
                        { key: "solitude", name: "Cosmic Solitude", desc: "Silent deep velvet dark, minimal luminance, star tracking elements." }
                      ].map(item => (
                        <button
                          key={item.key}
                          id={`wiz-aesthetic-${item.key}`}
                          onClick={() => setWizardAesthetic(item.key as any)}
                          className={`p-4 border text-left transition-all cursor-pointer ${
                            wizardAesthetic === item.key 
                              ? 'bg-white text-black border-white font-bold' 
                              : 'bg-transparent text-white border-white/10 hover:border-white/30'
                          }`}
                        >
                          <span className="block text-[10px] uppercase tracking-wider font-black">{item.name}</span>
                          <span className="block text-[9px] opacity-70 mt-1 leading-relaxed font-space font-light">{item.desc}</span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-between">
                      <button
                        id="wizard-prev-2"
                        onClick={() => setCalibrationStep(1)}
                        className="border border-white/20 text-white/70 hover:text-white px-5 py-3 text-[10px] uppercase font-bold tracking-widest cursor-pointer hover:bg-white/5"
                      >
                        Back
                      </button>
                      <button
                        id="wizard-next-2"
                        onClick={() => setCalibrationStep(3)}
                        className="bg-white text-black hover:bg-neutral-900 hover:text-white border border-white px-6 py-3 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Next Matrix Phase</span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: ALLOCATE RESOURCES */}
                {calibrationStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs uppercase tracking-widest font-bold text-white/80 mb-2">
                        Step 3: Allocate Conduit Weight Load
                      </h4>
                      <p className="text-xs text-white/50 font-space leading-relaxed mb-6">
                        Adjust sliders representing raw focus depth metrics.
                      </p>
                    </div>

                    <div className="space-y-5">
                      {/* Sliders with visual numerical feedback */}
                      <div>
                        <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1 font-bold font-space">
                          <span className="opacity-60">Cognitive Focus Capacity</span>
                          <span className="text-white">{allocationFocus}%</span>
                        </div>
                        <input
                          id="focus-slider"
                          type="range"
                          min="10"
                          max="100"
                          value={allocationFocus}
                          onChange={(e) => setAllocationFocus(parseInt(e.target.value))}
                          className="w-full h-1 bg-white/10 appearance-none cursor-pointer accent-white"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1 font-bold font-space">
                          <span className="opacity-60">Capital Investment Budget</span>
                          <span className="text-white">{allocationBudget}%</span>
                        </div>
                        <input
                          id="budget-slider"
                          type="range"
                          min="10"
                          max="100"
                          value={allocationBudget}
                          onChange={(e) => setAllocationBudget(parseInt(e.target.value))}
                          className="w-full h-1 bg-white/10 appearance-none cursor-pointer accent-white"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1 font-bold font-space">
                          <span className="opacity-60">Secrecy and Isolation Rating</span>
                          <span className="text-white">{allocationSecrecy}%</span>
                        </div>
                        <input
                          id="secrecy-slider"
                          type="range"
                          min="10"
                          max="100"
                          value={allocationSecrecy}
                          onChange={(e) => setAllocationSecrecy(parseInt(e.target.value))}
                          className="w-full h-1 bg-white/10 appearance-none cursor-pointer accent-white"
                        />
                      </div>
                    </div>

                    {/* Summary card before saving */}
                    <div className="bg-[#1A1A1A] p-4 text-[10px] border border-white/5 font-space uppercase">
                      <span className="opacity-40 block text-[8px] tracking-wider mb-1 font-bold">Calibration Summary State</span>
                      <p className="text-white leading-relaxed">
                        Setting identity to <span className="font-bold text-white underline">{wizardName || "Seeker"}</span> tuned to <span className="font-bold text-white">{wizardPursuit.toUpperCase()}</span> portal with <span className="font-bold text-white">{wizardAesthetic.toUpperCase()}</span> design styling. Focus capacity allocated at <span className="font-bold text-white">{allocationFocus}%</span> output.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-between">
                      <button
                        id="wizard-prev-3"
                        onClick={() => setCalibrationStep(2)}
                        className="border border-white/20 text-white/70 hover:text-white px-5 py-3 text-[10px] uppercase font-bold tracking-widest cursor-pointer hover:bg-white/5"
                      >
                        Back
                      </button>
                      <button
                        id="wizard-save-btn"
                        onClick={saveCalibration}
                        className="bg-white text-black hover:bg-neutral-900 hover:text-white border-2 border-white px-8 py-3 text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer flex items-center gap-2"
                      >
                        <CheckCircle size={14} />
                        <span>Commit Calibration</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: User Profile Overview + Toggle Settings (Requested Toggles) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Visual Conductor Info Badge */}
                <div className="bg-[#111] border border-white/10 p-6 relative">
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[8px] font-mono opacity-40 uppercase block">Terminal Registration ID</span>
                      <span className="text-[10px] font-bold text-white">CON_GRID_#02891</span>
                    </div>
                    <div className="w-10 h-10 border border-white/20 flex items-center justify-center bg-black">
                      <User className="text-white" size={16} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[8px] opacity-40 block uppercase tracking-wider">Conductor Designation</span>
                      <div className="text-xl font-black uppercase text-white font-syne">{userName}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                      <div>
                        <span className="text-[8px] opacity-40 block uppercase tracking-wider">Matrix Calibration</span>
                        <div className="text-xs font-bold uppercase text-white font-space">
                          {userCalibrated ? "Calibrated (94%)" : "Transient (Pending)"}
                        </div>
                      </div>
                      <div>
                        <span className="text-[8px] opacity-40 block uppercase tracking-wider">Pursuit Path</span>
                        <div className="text-xs font-bold uppercase text-white font-space">
                          {userPursuit.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {userCalibrated && (
                      <div className="border-t border-white/5 pt-4">
                        <button
                          id="reset-calib-btn"
                          onClick={resetCalibration}
                          className="text-[9px] uppercase tracking-wider text-white/50 hover:text-white underline cursor-pointer"
                        >
                          Clear & Reset Active Calibration
                        </button>
                      </div>
                    )}
                  </div>

                </div>

                {/* State Toggles (Requested simple form / interactivity with basic javascript state) */}
                <div className="bg-[#111] border border-white/10 p-5 space-y-4">
                  <h3 className="text-xs uppercase tracking-[0.25em] font-black text-white/80 border-b border-white/5 pb-2 font-syne">
                    System Override Toggle Panel
                  </h3>

                  <div className="space-y-3.5">
                    
                    {/* Toggle Switch 1 */}
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="block text-[10px] font-bold uppercase">Dark Mode Override</span>
                        <span className="block text-[8px] opacity-50 font-space lowercase">Forced cosmic black canvas theme</span>
                      </div>
                      <button
                        id="toggle-dark-mode"
                        onClick={() => setSysDarkModeOverride(!sysDarkModeOverride)}
                        className={`w-10 h-5 border transition-colors cursor-pointer flex items-center ${
                          sysDarkModeOverride ? 'bg-white border-white justify-end' : 'bg-transparent border-white/20 justify-start'
                        }`}
                      >
                        <span className={`w-4 h-4 inline-block ${sysDarkModeOverride ? 'bg-black' : 'bg-white'}`} />
                      </button>
                    </div>

                    {/* Toggle Switch 2 */}
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="block text-[10px] font-bold uppercase">Deep Coordinate Indexing</span>
                        <span className="block text-[8px] opacity-50 font-space lowercase">Includes Classified & Divine nodes</span>
                      </div>
                      <button
                        id="toggle-deep-indexing"
                        onClick={() => setSysDeepIndexing(!sysDeepIndexing)}
                        className={`w-10 h-5 border transition-colors cursor-pointer flex items-center ${
                          sysDeepIndexing ? 'bg-white border-white justify-end' : 'bg-transparent border-white/20 justify-start'
                        }`}
                      >
                        <span className={`w-4 h-4 inline-block ${sysDeepIndexing ? 'bg-black' : 'bg-white'}`} />
                      </button>
                    </div>

                    {/* Toggle Switch 3 */}
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="block text-[10px] font-bold uppercase">Direct Alerts</span>
                        <span className="block text-[8px] opacity-50 font-space lowercase">Enable real-time notification audio cue</span>
                      </div>
                      <button
                        id="toggle-direct-alerts"
                        onClick={() => setSysDirectNotifs(!sysDirectNotifs)}
                        className={`w-10 h-5 border transition-colors cursor-pointer flex items-center ${
                          sysDirectNotifs ? 'bg-white border-white justify-end' : 'bg-transparent border-white/20 justify-start'
                        }`}
                      >
                        <span className={`w-4 h-4 inline-block ${sysDirectNotifs ? 'bg-black' : 'bg-white'}`} />
                      </button>
                    </div>

                  </div>
                </div>

                {/* Feedback Input Module with focus highlighting */}
                <div className="bg-[#111] border border-white/10 p-5 space-y-3">
                  <h3 className="text-xs uppercase tracking-[0.25em] font-black text-white/80 font-syne">
                    Submit Archive Feedback
                  </h3>
                  <div>
                    <textarea
                      id="feedback-textarea"
                      rows={3}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      onFocus={() => setIsFeedbackFocused(true)}
                      onBlur={() => setIsFeedbackFocused(false)}
                      placeholder="Input spatial coordinates observations or systemic feedback..."
                      className={`w-full bg-[#1A1A1A] text-white text-xs px-3 py-2 border transition-all duration-300 focus:outline-none font-space font-medium placeholder:text-neutral-600 ${
                        isFeedbackFocused ? "border-white ring-1 ring-white bg-[#222]" : "border-white/10 hover:border-white/30"
                      }`}
                    />
                  </div>
                  <button
                    id="submit-feedback-btn"
                    onClick={() => {
                      if (feedbackText.trim() !== "") {
                        alert(`Conductor feedback logged into system state: "${feedbackText}"`);
                        setFeedbackText("");
                      }
                    }}
                    className="w-full text-center text-[10px] uppercase tracking-widest font-bold bg-white text-black py-2.5 hover:bg-neutral-900 hover:text-white border border-white transition-all cursor-pointer"
                  >
                    Transmit Observations
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* Node Detail Modal View Panel */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-6 z-50">
          <div className="bg-[#0D0D0D] border border-white/25 max-w-lg w-full p-6 md:p-8 relative">
            
            {/* Corner styling */}
            <div className="absolute top-0 left-0 w-8 h-[1px] bg-white" />
            <div className="absolute top-0 left-0 w-[1px] h-8 bg-white" />

            {/* Close Button */}
            <button
              id="close-modal-btn"
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-1 hover:bg-white/5 transition-all cursor-pointer rounded-full"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Header info */}
            <div className="mb-4">
              <div className="flex gap-2 items-center mb-1">
                <span className="text-[9px] uppercase tracking-widest bg-white/10 text-white/90 px-2 py-0.5 font-bold font-mono">
                  {selectedNode.type} Node
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-bold">
                  SECRECY: {selectedNode.secrecy}
                </span>
              </div>
              <h3 className="text-2xl font-black uppercase text-white font-syne tracking-tight mt-1">
                {selectedNode.name}
              </h3>
            </div>

            {/* Description */}
            <div className="space-y-4 text-xs font-space leading-relaxed text-white/80">
              <p className="border-l-2 border-white pl-3 italic text-white/90">
                {selectedNode.description}
              </p>
              
              <div className="bg-[#111] p-4 space-y-2 border border-white/5">
                <span className="text-[8px] opacity-40 uppercase block tracking-wider font-bold">Acoustic Guide Coordinate Data</span>
                <p className="text-[11px] text-white/95 font-mono">{selectedNode.details}</p>
              </div>

              {/* Statistics & Attributes Grid */}
              <div className="grid grid-cols-2 gap-4 pt-2 text-[10px] uppercase font-space">
                <div className="bg-[#111] p-2.5 border border-white/5">
                  <span className="opacity-40 block text-[8px] mb-0.5">Physical Distance</span>
                  <span className="font-bold text-white">{selectedNode.distance} KM ({(selectedNode.distance * 1000).toFixed(0)}m)</span>
                </div>
                <div className="bg-[#111] p-2.5 border border-white/5">
                  <span className="opacity-40 block text-[8px] mb-0.5">Seclusion Level</span>
                  <span className="font-bold text-white">{selectedNode.secrecy}</span>
                </div>
                <div className="bg-[#111] p-2.5 border border-white/5">
                  <span className="opacity-40 block text-[8px] mb-0.5">Atmosphere Density</span>
                  <span className="font-bold text-white">{selectedNode.focus} Focus</span>
                </div>
                <div className="bg-[#111] p-2.5 border border-white/5">
                  <span className="opacity-40 block text-[8px] mb-0.5">Spatial Index Rating</span>
                  <span className="font-bold text-white">{selectedNode.rating || "4.8 // Stable"}</span>
                </div>
              </div>

              {selectedNode.specialty && (
                <div className="text-[10px] uppercase tracking-wider font-mono">
                  <span className="opacity-40 font-bold">Signature Matrix Specialty:</span> <span className="text-white font-semibold">{selectedNode.specialty}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 pt-4 border-t border-white/5 flex gap-3">
              <button
                id="modal-reserve-btn"
                onClick={() => {
                  alert(`Pathway reserved successfully. Grid coordinates mapped to your terminal: SEC_LAT: ${(52.5200 + selectedNode.x / 1000).toFixed(4)}° N`);
                  setSelectedNode(null);
                }}
                className="flex-1 bg-white text-black hover:bg-neutral-900 hover:text-white border border-white py-3 text-xs font-black uppercase tracking-widest transition-all cursor-pointer text-center"
              >
                Reserve Path Coordinates
              </button>
              
              <button
                id="modal-cancel-btn"
                onClick={() => setSelectedNode(null)}
                className="border border-white/20 text-white/70 hover:text-white px-5 py-3 text-[10px] uppercase font-bold tracking-widest cursor-pointer hover:bg-white/5"
              >
                Close Node
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Persistent Footer details */}
      <footer className="border-t border-white/10 bg-[#0A0A0A] py-12 px-6 lg:px-12 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          
          <div className="flex flex-col sm:flex-row gap-8 lg:gap-16">
            <div>
              <div className="text-[9px] uppercase tracking-[0.3em] opacity-40 mb-1.5 font-bold">Active Region Location</div>
              <div className="text-[11px] font-bold text-white font-mono">52.5200° N, 13.4050° E // Berlin Terminal</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.3em] opacity-40 mb-1.5 font-bold">System Status</div>
              <div className="text-[11px] font-bold text-white font-mono">COGNITIVE INDEX: ONLINE</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.3em] opacity-40 mb-1.5 font-bold">Copyright Matrix</div>
              <div className="text-[11px] font-bold text-white font-mono">2026 © GODSPLAN // VAULT.01</div>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            {/* Interactive decorative button */}
            <button
              id="footer-audio-btn"
              onClick={() => {
                alert("Acoustic ambient tracking active. Sub-audible frequencies aligned.");
              }}
              className="w-12 h-12 rounded-full border border-white/20 hover:border-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 hover:bg-white/5"
              title="Align acoustic sensor"
            >
              <Volume2 size={16} className="text-white" />
            </button>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.2em] font-black text-white font-syne">Scroll to Map</div>
              <div className="text-[9px] opacity-40 italic font-space uppercase">Interactive Conduit Node Ready</div>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
