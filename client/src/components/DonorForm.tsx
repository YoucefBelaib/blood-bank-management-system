import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Droplet, Calendar, Weight, Heart, CheckCircle2, AlertCircle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDonorSchema, type InsertDonor } from "@shared/schema";
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

const DonorForm = () => {
    const { toast } = useToast();
    
    const form = useForm<InsertDonor>({
    resolver: zodResolver(insertDonorSchema),
    defaultValues: {
        fullName: "",
        age: 18,
        gender: "",
        bloodType: "",
        location: "",
        phone: "",
        email: "",
    },
    });

    const registerMutation = useMutation({
    mutationFn: async (data: InsertDonor) => {
        const response = await fetch("/api/donors", {
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
        title: "Registration Successful!",
        description: "Thank you for becoming a donor. You'll be notified when needed.",
        });
        form.reset();
    },
    onError: (error: Error) => {
        toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
        });
    },
    });

    const handleSubmit = form.handleSubmit((data) => {
    registerMutation.mutate(data);
    });

    const requirements = [
    { icon: Calendar, text: "Age between 18-65 years old", color: "from-red-500 to-red-600" },
    { icon: Weight, text: "Weight: +50kg", color: "from-red-600 to-red-700" },
    { icon: Droplet, text: "At least 8 weeks since last donation", color: "from-red-700 to-red-800" },
    { icon: Heart, text: "Be in good health condition", color: "from-red-800 to-red-900" },
    ];
    
  return (
    <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
                  <FormCard>
                    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-100 to-transparent rounded-full blur-3xl opacity-50" />
                      
                      <div className="relative z-10">
                        <div className="mb-8">
                          <h2 className="text-3xl font-bold text-gradient-red mb-2">Donor Registration</h2>
                          <p className="text-red-800">Fill in your details to register as a blood donor</p>
                        </div>
    
                        <Form {...form}>
                          <form onSubmit={handleSubmit} className="space-y-6" data-testid="donor-form">
                            <FormField
                              control={form.control}
                              name="fullName"
                              render={({ field }) => (
                                <FormItem>
                                  <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-gradient-to-r from-red-50 to-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all"
                                  >
                                    <FormLabel className="flex items-center gap-2 text-base font-semibold text-red-950 mb-3">
                                      <User className="w-5 h-5 text-red-600" />
                                      Full Name <span className="text-red-600">*</span>
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="Enter your full name"
                                        className="h-12 border-red-200 focus:border-red-600 focus:ring-red-600 bg-white"
                                        data-testid="fullName-input"
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
                                name="age"
                                render={({ field }) => (
                                  <FormItem>
                                    <motion.div
                                      whileHover={{ scale: 1.02 }}
                                      className="bg-gradient-to-r from-red-50 to-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all"
                                    >
                                      <FormLabel className="flex items-center gap-2 text-base font-semibold text-red-950 mb-3">
                                        <Calendar className="w-5 h-5 text-red-600" />
                                        Age <span className="text-red-600">*</span>
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type="number"
                                          placeholder="18-65"
                                          className="h-12 border-red-200 focus:border-red-600 focus:ring-red-600 bg-white"
                                          min="18"
                                          max="65"
                                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                          data-testid="age-input"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </motion.div>
                                  </FormItem>
                                )}
                              />
    
                              <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                  <FormItem>
                                    <motion.div
                                      whileHover={{ scale: 1.02 }}
                                      className="bg-gradient-to-r from-red-50 to-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all"
                                    >
                                      <FormLabel className="flex items-center gap-2 text-base font-semibold text-red-950 mb-3">
                                        <User className="w-5 h-5 text-red-600" />
                                        Gender <span className="text-red-600">*</span>
                                      </FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="h-12 border-red-200 focus:border-red-600 focus:ring-red-600 bg-white" data-testid="gender-select">
                                            <SelectValue placeholder="Select gender" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="male">Male</SelectItem>
                                          <SelectItem value="female">Female</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </motion.div>
                                  </FormItem>
                                )}
                              />
                            </div>
    
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
                                        placeholder="Your city or address"
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
                                          placeholder="your.email@example.com"
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
                              disabled={registerMutation.isPending}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full h-14 gradient-red-primary text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              data-testid="submit-button"
                            >
                              {registerMutation.isPending ? (
                                <>
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                  />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-5 h-5" />
                                  Register as Donor
                                </>
                              )}
                            </motion.button>
                          </form>
                        </Form>
                      </div>
                    </div>
                  </FormCard>
                </div>
    
  )
}

export default DonorForm