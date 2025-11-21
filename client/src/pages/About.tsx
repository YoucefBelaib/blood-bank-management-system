import { motion } from "framer-motion";
import {
  Heart,
  Mail,
  Phone,
  Palette,
  Code,
  Server,
  BarChart3,
  Lightbulb,
  Users,
} from "lucide-react";
import { AnimatedNav } from "@/components/AnimatedNav";
import { BloodDropsAnimation } from "@/components/BloodDrop";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const founders = [
  {
    name: "Oumaima Boucekkine & Yousra Hind Bennabi",
    role: "UX Designer",
    icon: Palette,
    gradient: "from-red-400 to-red-600",
    description: "Crafting intuitive experiences that save lives",
  },
  {
    name: "Islam Benali & Youcef Belaib",
    role: "Frontend Engineer",
    icon: Code,
    gradient: "from-red-500 to-red-700",
    description: "Building beautiful interfaces with cutting-edge technology",
  },
  {
    name: "Malak Felioune",
    role: "Backend Engineer",
    icon: Server,
    gradient: "from-red-600 to-red-800",
    description: "Architecting robust systems that never fail",
  },
];

function FounderCard({
  founder,
  index,
}: {
  founder: (typeof founders)[0];
  delay: number;
  index: number;
}) {
  const Icon = founder.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="min-w-[320px] md:min-w-[360px]"
    >
      <div className="relative group h-full">
        <motion.div
          whileHover={{ y: -10, scale: 1.02 }}
          className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden h-full flex flex-col"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-transparent rounded-full blur-2xl opacity-50" />

          <div className="relative z-10 flex flex-col items-center text-center flex-1">
            <motion.div
              className="relative mb-6"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.3,
              }}
            >
              <motion.div
                className={`w-32 h-32 bg-gradient-to-br ${founder.gradient} rounded-full flex items-center justify-center shadow-2xl relative`}
                whileHover={{ scale: 1.1 }}
              >
                <Icon className="w-16 h-16 text-white" />

                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle, transparent 40%, ${founder.gradient.includes("400") ? "#f87171" : "#ef4444"} 100%)`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.1, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2,
                  }}
                />
              </motion.div>

              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${founder.gradient} rounded-full blur-xl opacity-50 -z-10`}
                animate={{
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.4,
                }}
              />
            </motion.div>

            <h3 className="text-2xl font-bold text-red-950 mb-2">
              {founder.name}
            </h3>
            <p
              className={`text-sm font-semibold uppercase tracking-wider bg-gradient-to-r ${founder.gradient} bg-clip-text text-transparent mb-4`}
            >
              {founder.role}
            </p>
            <p className="text-red-800 leading-relaxed flex-1">
              {founder.description}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
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

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white overflow-hidden">
      <AnimatedNav />
      <BloodDropsAnimation />

      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-block mb-6">
              <div className="w-20 h-20 gradient-red-primary rounded-full mx-auto flex items-center justify-center shadow-2xl">
                <Users className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-6xl font-bold text-gradient-red mb-4"
            >
              About VitaBlood
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-red-800 max-w-2xl mx-auto"
            >
              A passionate team dedicated to connecting donors with those in
              need
            </motion.p>
          </motion.div>

          <StorySection>
            <div className="max-w-4xl mx-auto mb-20">
              <div className="bg-white rounded-3xl shadow-2xl p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-red-100 to-transparent rounded-full blur-3xl opacity-50" />

                <div className="relative z-10">
                  <div className="flex items-start gap-6 mb-8">
                    <div className="w-16 h-16 gradient-red-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gradient-red mb-4">
                        Our Mission
                      </h2>
                      <p className="text-lg text-red-900 leading-relaxed">
                        We are a team of passionate technologists and healthcare
                        advocates who developed VitaBlood to revolutionize blood
                        donation. Our platform connects donors and hospitals
                        instantly, ensuring that every drop of blood reaches
                        those who need it most, when they need it most.
                      </p>
                    </div>
                  </div>

                  <div className="border-t-2 border-red-100 pt-8 mt-8">
                    <h3 className="text-2xl font-bold text-red-950 mb-4">
                      Smart Blood Banking
                    </h3>
                    <p className="text-lg text-red-900 leading-relaxed">
                      Leveraging cutting-edge technology to create an efficient,
                      reliable, and life-saving connection between those who can
                      give and those who desperately need. Every second counts,
                      and we're here to make sure no second is wasted.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </StorySection>

          <StorySection delay={0.2}>
            <div className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gradient-red mb-4">
                  Meet Our Team
                </h2>
                <p className="text-xl text-red-800">
                  The minds and hearts behind VitaBlood
                </p>
              </div>

              <div className="relative">
                <div className="overflow-hidden">
                  <motion.div
                    animate={{
                      x: [0, -20, 0],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="flex gap-6 pb-8"
                    style={{
                      width: "fit-content",
                    }}
                  >
                    {founders.map((founder, index) => (
                      <FounderCard
                        key={founder.name}
                        founder={founder}
                        index={index}
                        delay={index * 0.1}
                      />
                    ))}
                  </motion.div>
                </div>

                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
              </div>
            </div>
          </StorySection>

          <StorySection delay={0.3}>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-transparent rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />

                <div className="relative z-10">
                  <div className="w-14 h-14 gradient-red-primary rounded-2xl flex items-center justify-center mb-6">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-950 mb-4">
                    Email Us
                  </h3>
                  <a
                    href="mailto:contact@vitablood.com"
                    className="text-lg text-red-600 hover:text-red-700 font-semibold transition-colors"
                  >
                    contact@vitablood.com
                  </a>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-transparent rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />

                <div className="relative z-10">
                  <div className="w-14 h-14 gradient-red-primary rounded-2xl flex items-center justify-center mb-6">
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-950 mb-4">
                    Call Us
                  </h3>
                  <a
                    href="tel:+2135555555555"
                    className="text-lg text-red-600 hover:text-red-700 font-semibold transition-colors"
                  >
                    +213 555 555 5555
                  </a>
                </div>
              </motion.div>
            </div>
          </StorySection>

          <StorySection delay={0.4}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="max-w-4xl mx-auto bg-gradient-to-r from-red-900 to-red-700 rounded-3xl shadow-2xl p-12 relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: "40px 40px",
                  }}
                />
              </div>

              <div className="relative z-10 text-center">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block mb-6"
                >
                  <Heart className="w-16 h-16 text-white fill-white mx-auto" />
                </motion.div>
                <h3 className="text-4xl font-bold text-white mb-4">
                  Join Our Movement
                </h3>
                <p className="text-xl text-red-100 max-w-2xl mx-auto leading-relaxed">
                  Be part of something extraordinary. Every donation creates a
                  ripple of hope that transforms lives and brings families
                  together.
                </p>
              </div>
            </motion.div>
          </StorySection>
        </div>
      </div>
    </div>
  );
}
