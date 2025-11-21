import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Droplet, AlertCircle, AlertTriangle, Building2, Phone, Mail, MapPin, Hash } from "lucide-react";
import { AnimatedNav } from "@/components/AnimatedNav";
import { BloodDropsAnimation } from "@/components/BloodDrop";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/animations";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBloodRequestSchema, type InsertBloodRequest } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BloodInventory {
  id: string;
  bloodType: string;
  unitsAvailable: number;
  status: string;
}

function FormCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, isVisible } = useScrollAnimation(0.1);
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { delay, duration: 0.5 }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export default function RequestBlood() {
  const { toast } = useToast();
  
  const form = useForm<InsertBloodRequest>({
    resolver: zodResolver(insertBloodRequestSchema),
    defaultValues: {
      hospitalName: "",
      bloodType: "",
      unitsNeeded: 1,
      urgencyLevel: "",
      location: "",
      phone: "",
      email: "",
    },
  });

  const { data: inventory } = useQuery<BloodInventory[]>({
    queryKey: ["blood-inventory"],
    queryFn: async () => {
      const response = await fetch("/api/blood-inventory");
      if (!response.ok) throw new Error("Failed to fetch inventory");
      return response.json();
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (data: InsertBloodRequest) => {
      const response = await fetch("/api/blood-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted!",
        description: "Your blood request has been submitted successfully.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    requestMutation.mutate(data);
  });

  const sortedInventory = inventory
    ? [...inventory].sort((a, b) => {
        const statusOrder = { Critical: 0, Low: 1, Available: 2 };
        const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
        const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
        return aOrder - bOrder;
      })
    : [];

  const getStatusGradient = (status: string) => {
    switch (status.toLowerCase()) {
      case "critical":
        return "from-red-900 to-red-700";
      case "low":
        return "from-red-600 to-red-800";
      case "available":
        return "from-red-400 to-red-600";
      default:
        return "from-red-500 to-red-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "critical":
        return <AlertCircle className="w-6 h-6" />;
      case "low":
        return <AlertTriangle className="w-6 h-6" />;
      default:
        return <Droplet className="w-6 h-6" />;
    }
  };

  const getAnimationDelay = (status: string) => {
    switch (status.toLowerCase()) {
      case "critical":
        return 0.5;
      case "low":
        return 1;
      default:
        return 1.5;
    }
  };

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
            <motion.div
              variants={fadeInUp}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 gradient-red-primary rounded-full mx-auto flex items-center justify-center shadow-2xl">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl font-bold text-gradient-red mb-4">
              Request Blood
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-red-800 max-w-2xl mx-auto">
              Check availability and submit your urgent blood request
            </motion.p>
          </motion.div>

          <FormCard>
            <div className="mb-16">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-gradient-red mb-3">Current Availability</h2>
                <p className="text-red-800">Real-time blood inventory across our partner hospitals</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                <AnimatePresence>
                  {sortedInventory?.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="relative"
                      data-testid={`blood-inventory-${item.bloodType}`}
                    >
                      <div className={`bg-gradient-to-br ${getStatusGradient(item.status)} rounded-3xl p-6 shadow-xl text-white relative overflow-hidden`}>
                        {item.status.toLowerCase() === "critical" && (
                          <motion.div
                            className="absolute inset-0 bg-red-400"
                            animate={{ opacity: [0, 0.3, 0] }}
                            transition={{ duration: getAnimationDelay(item.status), repeat: Infinity }}
                          />
                        )}
                        
                        <div className="relative z-10 text-center space-y-3">
                          <div className="flex justify-center">
                            {getStatusIcon(item.status)}
                          </div>
                          <p className="text-3xl font-bold" data-testid={`blood-type-${item.bloodType}`}>
                            {item.bloodType}
                          </p>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold uppercase tracking-wider opacity-90">
                              {item.status}
                            </p>
                            <p className="text-2xl font-bold" data-testid={`units-${item.bloodType}`}>
                              {item.unitsAvailable}
                            </p>
                            <p className="text-sm opacity-90">units</p>
                          </div>
                        </div>
                      </div>

                      {item.status.toLowerCase() === "critical" && (
                        <motion.div
                          className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </FormCard>

          <FormCard delay={0.3}>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-red-100 to-transparent rounded-full blur-3xl opacity-50" />
                
                <div className="relative z-10">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gradient-red mb-2">Submit Blood Request</h2>
                    <p className="text-red-800">Fill in the details for your blood request</p>
                  </div>

                  <Form {...form}>
                    <form onSubmit={handleSubmit} className="space-y-6" data-testid="request-form">
                      <FormField
                        control={form.control}
                        name="hospitalName"
                        render={({ field }) => (
                          <FormItem>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="bg-gradient-to-r from-red-50 to-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all"
                            >
                              <FormLabel className="flex items-center gap-2 text-base font-semibold text-red-950 mb-3">
                                <Building2 className="w-5 h-5 text-red-600" />
                                Hospital Name <span className="text-red-600">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Enter hospital name"
                                  className="h-12 border-red-200 focus:border-red-600 focus:ring-red-600 bg-white"
                                  data-testid="hospitalName-input"
                                />
                              </FormControl>
                              <FormMessage />
                            </motion.div>
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="bloodType"
                          render={({ field }) => (
                            <FormItem>
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-gradient-to-r from-red-50 to-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all"
                              >
                                <FormLabel className="flex items-center gap-2 text-base font-semibold text-red-950 mb-3">
                                  <Droplet className="w-5 h-5 text-red-600" />
                                  Blood Type <span className="text-red-600">*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-12 border-red-200 focus:border-red-600 focus:ring-red-600 bg-white" data-testid="bloodType-select">
                                      <SelectValue placeholder="Select blood type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                                      <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </motion.div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="unitsNeeded"
                          render={({ field }) => (
                            <FormItem>
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-gradient-to-r from-red-50 to-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all"
                              >
                                <FormLabel className="flex items-center gap-2 text-base font-semibold text-red-950 mb-3">
                                  <Hash className="w-5 h-5 text-red-600" />
                                  Units Needed <span className="text-red-600">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    placeholder="Number of units"
                                    className="h-12 border-red-200 focus:border-red-600 focus:ring-red-600 bg-white"
                                    min="1"
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    data-testid="unitsNeeded-input"
                                  />
                                </FormControl>
                                <FormMessage />
                              </motion.div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="urgencyLevel"
                        render={({ field }) => (
                          <FormItem>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="bg-gradient-to-r from-red-50 to-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all"
                            >
                              <FormLabel className="flex items-center gap-2 text-base font-semibold text-red-950 mb-3">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                Urgency Level <span className="text-red-600">*</span>
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 border-red-200 focus:border-red-600 focus:ring-red-600 bg-white" data-testid="urgencyLevel-select">
                                    <SelectValue placeholder="Select urgency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="critical">Critical - Immediate</SelectItem>
                                  <SelectItem value="urgent">Urgent - Within 24 hours</SelectItem>
                                  <SelectItem value="normal">Normal - Within a week</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </motion.div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="bg-gradient-to-r from-red-50 to-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all"
                            >
                              <FormLabel className="flex items-center gap-2 text-base font-semibold text-red-950 mb-3">
                                <MapPin className="w-5 h-5 text-red-600" />
                                Location <span className="text-red-600">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Hospital location or address"
                                  className="h-12 border-red-200 focus:border-red-600 focus:ring-red-600 bg-white"
                                  data-testid="location-input"
                                />
                              </FormControl>
                              <FormMessage />
                            </motion.div>
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-gradient-to-r from-red-50 to-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all"
                              >
                                <FormLabel className="flex items-center gap-2 text-base font-semibold text-red-950 mb-3">
                                  <Phone className="w-5 h-5 text-red-600" />
                                  Phone <span className="text-red-600">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="+213555123456"
                                    className="h-12 border-red-200 focus:border-red-600 focus:ring-red-600 bg-white"
                                    data-testid="phone-input"
                                  />
                                </FormControl>
                                <FormMessage />
                              </motion.div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-gradient-to-r from-red-50 to-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all"
                              >
                                <FormLabel className="flex items-center gap-2 text-base font-semibold text-red-950 mb-3">
                                  <Mail className="w-5 h-5 text-red-600" />
                                  Email <span className="text-red-600">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="email"
                                    placeholder="hospital@example.com"
                                    className="h-12 border-red-200 focus:border-red-600 focus:ring-red-600 bg-white"
                                    data-testid="email-input"
                                  />
                                </FormControl>
                                <FormMessage />
                              </motion.div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <motion.button
                        type="submit"
                        disabled={requestMutation.isPending}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full h-14 gradient-red-primary text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        data-testid="submit-button"
                      >
                        {requestMutation.isPending ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5" />
                            Submit Request
                          </>
                        )}
                      </motion.button>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          </FormCard>
        </div>
      </div>
    </div>
  );
}
