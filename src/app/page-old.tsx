import Navbar from "~/components/navbar";
import SignoutButton from "~/components/auth/signout-button";
import { getServerSession } from "~/server/auth";
import { HeroClient } from "~/components/landing/hero-client";
import { FeaturesClient } from "~/components/landing/features-client";

const Hero = () => {
  const financialSolutions = [
    "EMI SOLUTIONS",
    "ZERO INTEREST", 
    "FLEXIBLE PAYMENTS",
    "EDUCATION FINANCE",
    "AFFORDABLE FEES",
    "INSTANT APPROVAL",
    "SECURE PAYMENTS",
    "SMART FINANCE"
  ];
  
  const modernColors = [
    { bg: "bg-gradient-to-r from-blue-500/10 to-cyan-500/10", text: "text-blue-600", border: "border-blue-200", glow: "shadow-blue-200/50" },
    { bg: "bg-gradient-to-r from-green-500/10 to-emerald-500/10", text: "text-green-600", border: "border-green-200", glow: "shadow-green-200/50" },
    { bg: "bg-gradient-to-r from-purple-500/10 to-violet-500/10", text: "text-purple-600", border: "border-purple-200", glow: "shadow-purple-200/50" },
    { bg: "bg-gradient-to-r from-orange-500/10 to-amber-500/10", text: "text-orange-600", border: "border-orange-200", glow: "shadow-orange-200/50" },
    { bg: "bg-gradient-to-r from-pink-500/10 to-rose-500/10", text: "text-pink-600", border: "border-pink-200", glow: "shadow-pink-200/50" },
    { bg: "bg-gradient-to-r from-teal-500/10 to-cyan-500/10", text: "text-teal-600", border: "border-teal-200", glow: "shadow-teal-200/50" },
    { bg: "bg-gradient-to-r from-indigo-500/10 to-blue-500/10", text: "text-indigo-600", border: "border-indigo-200", glow: "shadow-indigo-200/50" },
    { bg: "bg-gradient-to-r from-emerald-500/10 to-green-500/10", text: "text-emerald-600", border: "border-emerald-200", glow: "shadow-emerald-200/50" }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % financialSolutions.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const currentColor = modernColors[currentIndex % modernColors.length];

  return (
    <section className="relative min-h-screen bg-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
      
      <div className="container mx-auto lg:max-w-7xl md:max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center justify-center min-h-screen pt-20 pb-16">
          
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              className={`inline-flex items-center px-4 py-2 rounded-full border ${currentColor.bg} ${currentColor.border} ${currentColor.text} text-sm font-medium mb-6 shadow-lg ${currentColor.glow}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Icon icon="mdi:school" className="w-4 h-4 mr-2" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {financialSolutions[currentIndex]}
                </motion.span>
              </AnimatePresence>
            </motion.div>

            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                MyFee
              </span>
              <br />
              <span className="text-gray-800 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                Zero Interest EMI for{" "}
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Education
                </span>
              </span>
            </motion.h1>

            <motion.p 
              className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Transform how education is financed. Our platform connects institutions and parents with 
              flexible, zero-interest EMI solutions that make quality education accessible to everyone.
            </motion.p>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Link 
              href="/signup/parent"
              className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center">
                <Icon icon="mdi:account-heart" className="w-5 h-5 mr-2" />
                Start as Parent
              </span>
            </Link>
            <Link 
              href="/signup/institution"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center">
                <Icon icon="mdi:school" className="w-5 h-5 mr-2" />
                Register Institution
              </span>
            </Link>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl border border-blue-100 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <Icon icon="mdi:school" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">For Institutions</h3>
              <p className="text-blue-700 mb-6 leading-relaxed">
                Comprehensive dashboard to manage student applications, approve EMI plans, and track payments with real-time analytics.
              </p>
              <div className="bg-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Demo:</strong> admin@school.edu / admin123
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
                <Icon icon="mdi:account-heart" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-4">For Parents</h3>
              <p className="text-green-700 mb-6 leading-relaxed">
                Apply for flexible zero-interest EMI plans (3, 6, or 12 months) for your child's education with easy tracking.
              </p>
              <div className="bg-green-100 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>Demo:</strong> parent@example.com / parent123
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-8 rounded-2xl border border-purple-100 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mb-6">
                <Icon icon="mdi:lightning-bolt" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-purple-900 mb-4">Zero Interest</h3>
              <p className="text-purple-700 mb-6 leading-relaxed">
                No hidden charges, no interest rates. Just transparent, affordable payment plans that work for everyone.
              </p>
              <div className="bg-purple-100 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800">
                  <strong>Benefits:</strong> Instant approval & secure payments
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      icon: "mdi:shield-check",
      title: "Secure & Transparent",
      description: "Bank-grade security with transparent fee structures and no hidden charges.",
      color: "blue"
    },
    {
      icon: "mdi:clock-fast",
      title: "Instant Approval",
      description: "Get approved within minutes with our automated verification system.",
      color: "green"
    },
    {
      icon: "mdi:chart-line",
      title: "Smart Analytics",
      description: "Real-time dashboards and insights for institutions and parents.",
      color: "purple"
    },
    {
      icon: "mdi:phone",
      title: "Mobile Friendly",
      description: "Access your account and make payments from anywhere, anytime.",
      color: "orange"
    }
  ];

  const colorMap = {
    blue: { bg: "from-blue-500 to-cyan-500", text: "text-blue-600" },
    green: { bg: "from-green-500 to-emerald-500", text: "text-green-600" },
    purple: { bg: "from-purple-500 to-violet-500", text: "text-purple-600" },
    orange: { bg: "from-orange-500 to-amber-500", text: "text-orange-600" }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto lg:max-w-7xl md:max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MyFee</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built with modern technology to provide the best experience for both institutions and parents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${colorMap[feature.color].bg} rounded-xl flex items-center justify-center mb-6`}>
                <Icon icon={feature.icon} className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-4 ${colorMap[feature.color].text}`}>
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default async function Home() {
  const session = await getServerSession();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroClient />
      <FeaturesClient />
      
      {session && (
        <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="container mx-auto text-center px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome back, {session.user?.name}!
            </h2>
            <p className="text-gray-600 mb-8">
              Ready to continue managing your educational finance?
            </p>
            <SignoutButton />
          </div>
        </section>
      )}
    </main>
  );
}
