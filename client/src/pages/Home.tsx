import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Heart,
  Users,
  Droplet,
  Building2,
  ArrowRight,
  Activity,
  Clock,
  Shield,
} from "lucide-react";
import { AnimatedNav } from "@/components/AnimatedNav";
import { BloodDropsAnimation } from "@/components/BloodDrop";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  fadeInUp,
  staggerContainer,
  scaleIn,
  slideInLeft,
  slideInRight,
} from "@/lib/animations";

interface Statistics {
  activeDonors: number;
  totalBloodUnits: number;
  partnerHospitals: number;
}

function StorySection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { delay, staggerChildren: 0.2 },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const { data: stats } = useQuery<Statistics>({
    queryKey: ["statistics"],
    queryFn: async () => {
      const response = await fetch("/api/statistics");
      if (!response.ok) throw new Error("Failed to fetch statistics");
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <AnimatedNav />

      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <BloodDropsAnimation fullScreen={true} />
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-100 opacity-60" />

        <motion.div
          className="container mx-auto px-6 relative z-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div variants={fadeInUp} className="inline-block">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 gradient-red-primary rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl"
              >
                <Droplet className="w-12 h-12 text-white fill-white" />
              </motion.div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-6xl md:text-7xl font-bold text-gradient-red leading-tight"
            >
              A Drop of Hope
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-2xl md:text-3xl text-red-900 max-w-3xl mx-auto leading-relaxed"
            >
              Every heartbeat tells a story. Every donation writes a new chapter
              of life.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
            >
              <motion.a
                href="/donate"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 gradient-red-primary text-white rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-shadow flex items-center gap-2"
                data-testid="hero-donate-button"
              >
                Become a Donor
                <ArrowRight className="w-5 h-5" />
              </motion.a>

              <motion.a
                href="/request"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white border-2 border-red-600 text-red-600 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
                data-testid="hero-request-button"
              >
                Request Blood
              </motion.a>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <StorySection delay={0.2}>
        <section className="py-32 bg-gradient-to-br from-white to-red-50 relative">
          <div className="container mx-auto px-6">
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-5xl font-bold text-gradient-red mb-4 pb-2">
                Your Story Begins Here
              </h2>
              <p className="text-xl text-red-800 max-w-2xl mx-auto pb-2">
                Three simple steps to become a hero in someone's life story
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Heart,
                  title: "Register",
                  description:
                    "Fill out a simple form and join our community of lifesavers",
                  color: "from-red-500 to-red-700",
                },
                {
                  icon: Activity,
                  title: "Donate",
                  description:
                    "Visit our partner hospitals and make your life-saving donation",
                  color: "from-red-600 to-red-800",
                },
                {
                  icon: Users,
                  title: "Impact",
                  description:
                    "Watch your contribution save lives and bring hope to families",
                  color: "from-red-700 to-red-900",
                },
              ].map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={index}
                    variants={scaleIn}
                    whileHover={{ y: -10 }}
                    className="relative group"
                  >
                    <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                      <div
                        className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-red-950 mb-4">
                        {step.title}
                      </h3>
                      <p className="text-red-800 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity -z-10`}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </StorySection>

      <StorySection delay={0.3}>
        <section className="py-32 bg-gradient-to-br from-red-50 to-white relative overflow-hidden">
          <div className="container mx-auto px-6">
            <motion.div variants={slideInLeft} className="text-center mb-16">
              <h2 className="text-5xl font-bold text-gradient-red mb-4 pb-2">
                Lives Changed, Hope Restored
              </h2>
              <p className="text-xl text-red-800 max-w-2xl mx-auto pb-2">
                Real impact, real numbers, real lives saved every single day
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: Users,
                  label: "Active Donors",
                  value: stats?.activeDonors || 0,
                  suffix: "+",
                },
                {
                  icon: Droplet,
                  label: "Blood Units Collected",
                  value: stats?.totalBloodUnits || 0,
                  suffix: "+",
                },
                {
                  icon: Building2,
                  label: "Partner Hospitals",
                  value: stats?.partnerHospitals || 0,
                  suffix: "",
                },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                    data-testid={`stat-card-${index}`}
                  >
                    <div className="bg-white rounded-3xl p-10 text-center shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group">
                      <motion.div
                        className="absolute inset-0 gradient-red-soft opacity-0 group-hover:opacity-100 transition-opacity"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />

                      <div className="relative z-10">
                        <div className="w-20 h-20 gradient-red-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <Icon className="w-10 h-10 text-white" />
                        </div>
                        <motion.p
                          className="text-5xl font-bold text-gradient-red mb-3"
                          data-testid={`stat-value-${index}`}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.2,
                          }}
                        >
                          {stat.value}
                          {stat.suffix}
                        </motion.p>
                        <p className="text-red-900 font-semibold text-lg">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </StorySection>

      <StorySection delay={0.4}>
        <section className="py-32 bg-gradient-to-br from-white to-red-50">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
              <motion.div variants={slideInLeft} className="space-y-6">
                <h2 className="text-5xl font-bold text-gradient-red leading-tight">
                  Every Second Counts
                </h2>
                <p className="text-xl text-red-900 leading-relaxed">
                  In emergency rooms across the country, patients are waiting.
                  Families are hoping. Your decision to donate today could be
                  the difference between despair and joy.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Clock, text: "Quick 15-minute donation process" },
                    {
                      icon: Shield,
                      text: "Safe, sterile, and professional care",
                    },
                    {
                      icon: Heart,
                      text: "Save up to 3 lives with one donation",
                    },
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={index}
                        variants={fadeInUp}
                        className="flex items-center gap-4 group"
                      >
                        <div className="w-12 h-12 gradient-red-primary rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-red-900 font-medium text-lg">
                          {item.text}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div variants={slideInRight} className="relative">
                <div className="relative">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 gradient-red-primary rounded-3xl blur-xl"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.2, 0.1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    />
                  ))}
                  <div className="relative bg-white rounded-3xl p-12 shadow-2xl">
                    <div className="text-center space-y-6">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-32 h-32 mx-auto"
                      >
                        <div className="w-full h-full gradient-red-radial rounded-full flex items-center justify-center shadow-2xl">
                          <Droplet className="w-16 h-16 text-white fill-white" />
                        </div>
                      </motion.div>
                      <p className="text-3xl font-bold text-gradient-red">
                        Be the Lifeline
                      </p>
                      <p className="text-red-800 text-lg">
                        Someone needs you right now
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </StorySection>

      <StorySection delay={0.5}>
        <section className="py-32 bg-gradient-to-br from-red-900 to-red-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="container mx-auto px-6 text-center relative z-10"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-5xl md:text-6xl font-bold text-white mb-8"
            >
              Join the Movement
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-2xl text-red-100 max-w-3xl mx-auto mb-12"
            >
              Be part of something bigger. Your donation today creates ripples
              of hope that will be felt for generations to come.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <motion.a
                href="/donate"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-red-600 rounded-full font-bold text-xl shadow-2xl hover:shadow-3xl transition-all"
                data-testid="cta-donate-button"
              >
                Start Your Journey
                <ArrowRight className="w-6 h-6" />
              </motion.a>
            </motion.div>
          </motion.div>
        </section>
      </StorySection>

      <footer className="bg-red-950 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 gradient-red-primary rounded-full flex items-center justify-center">
              <Droplet className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold">VitaBlood</span>
          </div>
          <p className="text-red-200">
            Connecting donors with those in need. Saving lives, one donation at
            a time.
          </p>
          <p className="text-red-300 text-sm mt-4">
            © 2025 VitaBlood. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
