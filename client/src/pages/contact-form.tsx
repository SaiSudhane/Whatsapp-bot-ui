import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Phone } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { countries } from "@/data/countries";

// Form schema for contact form
const contactFormSchema = z.object({
  salutation: z.string().min(1, "Salutation is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  country_code: z.string().default("+65"),
  mobile_number: z.string().min(8, "Valid mobile number is required"),
  age_group: z.string().min(1, "Age group is required"),
  privacy_consent: z.boolean().refine(val => val === true, {
    message: "You must agree to the privacy policy to continue",
  }),
  recaptcha_token: z.string().optional(), // Will be set programmatically
  message: z.string().optional(), // Adding as optional for API compatibility
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactForm() {
  const { toast } = useToast();
  const [countrySearch, setCountrySearch] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      salutation: "",
      first_name: "",
      last_name: "",
      email: "",
      country_code: "+65", // Singapore
      mobile_number: "",
      age_group: "",
      privacy_consent: false,
      recaptcha_token: "",
    },
  });

  const onReCAPTCHAChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const resetReCAPTCHA = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
    setRecaptchaToken(null);
  };

  const onSubmit = async (data: ContactFormValues) => {
    if (!recaptchaToken) {
      toast({
        title: "ReCAPTCHA verification required",
        description: "Please complete the ReCAPTCHA verification before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Fixed advisor_id for demonstration
      const advisorId = 1; // This would normally come from a configuration or route param

      // Prepare data for submission
      const submitData = {
        ...data,
        advisor_id: advisorId,
        recaptcha_token: recaptchaToken,
        mobile_number: `${data.country_code}${data.mobile_number.replace(/^0+/, '')}`, // Normalize number format
        message: data.message || "", // Ensure message is included for API compatibility
      };

      // Make API call to backend
      const response = await fetch("https://backend.myadvisor.sg/submit_form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to submit form");
      }

      // Show success and reset form
      toast({
        title: "Form submitted successfully",
        description: "Thank you for your message. We'll contact you shortly.",
      });

      setSubmitted(true);
      form.reset();
      resetReCAPTCHA();
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
      resetReCAPTCHA();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <main className="flex-1 px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {submitted ? (
            <Card className="w-full shadow-lg border-blue-200">
              <CardHeader className="text-center border-b border-blue-100 bg-blue-50/50">
                <div className="flex justify-center mb-3">
                  <img src="/assets/logo.jpg" alt="MyAdvisor.sg Logo" className="h-12 object-contain" />
                </div>
                <CardTitle className="text-2xl text-blue-800">Thank You!</CardTitle>
                <CardDescription className="text-blue-600">
                  Your message has been received. Our advisors will contact you shortly.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center p-8">
                <div className="bg-green-50 text-green-700 p-6 rounded-full mb-6 border border-green-100">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-center mb-6 text-slate-700">
                  We appreciate your interest in connecting with our financial advisors. 
                  Someone from our team will reach out to you on WhatsApp shortly.
                </p>
                <Button 
                  onClick={() => setSubmitted(false)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Submit Another Message
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full shadow-lg border-blue-200">
              <CardHeader className="text-center border-b border-blue-100 bg-blue-50/50">
                <div className="flex justify-center mb-3">
                  <img src="/assets/logo.jpg" alt="MyAdvisor.sg Logo" className="h-12 object-contain" />
                </div>
                <CardTitle className="text-2xl text-blue-800">Contact Our Financial Advisor</CardTitle>
                <CardDescription className="text-blue-600">
                  Complete the form below to connect with experienced advisors who can help with your financial goals.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="salutation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Salutation</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select salutation" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Mr">Mr</SelectItem>
                                <SelectItem value="Mrs">Mrs</SelectItem>
                                <SelectItem value="Ms">Ms</SelectItem>
                                <SelectItem value="Dr">Dr</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="age_group"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age Group</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select age group" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="18-24">18-24</SelectItem>
                                <SelectItem value="25-34">25-34</SelectItem>
                                <SelectItem value="35-44">35-44</SelectItem>
                                <SelectItem value="45-54">45-54</SelectItem>
                                <SelectItem value="55-64">55-64</SelectItem>
                                <SelectItem value="65+">65+</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your first name" className="placeholder:text-gray-300" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your last name" className="placeholder:text-gray-300" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="your.email@example.com" className="placeholder:text-gray-300" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex flex-col space-y-1.5">
                        <FormLabel>Mobile Number</FormLabel>
                        <div className="flex">
                          <FormField
                            control={form.control}
                            name="country_code"
                            render={({ field }) => (
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-[100px] rounded-r-none">
                                    <SelectValue placeholder="+65" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
  <div className="relative px-2 pb-1">
    <Input
      className="mb-2 h-8 text-xs placeholder:text-gray-400"
      placeholder="Search country or code..."
      value={countrySearch}
      onChange={(e) => setCountrySearch(e.target.value)}
    />
  </div>
  <div className="country-list max-h-[200px] overflow-y-auto">
    {countries
      .filter((country) => {
        const query = countrySearch.toLowerCase();
        return (
          country.name.toLowerCase().includes(query) ||
          country.dial_code.includes(query)
        );
      })
      .map((country) => (
        <SelectItem key={country.code} value={country.dial_code}>
          {country.dial_code}{" "}
          {country.flag
            .toUpperCase()
            .replace(/./g, (char) =>
              String.fromCodePoint(char.charCodeAt(0) + 127397)
            )}{" "}
          {country.name}
        </SelectItem>
      ))}
  </div>
</SelectContent>
                              </Select>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="mobile_number"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input 
                                    placeholder="91234567" 
                                    className="rounded-l-none placeholder:text-gray-300" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormDescription className="px-0.5">
                          We'll contact you via WhatsApp.
                        </FormDescription>
                      </div>
                    </div>

                    <div className="flex justify-center my-6">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey="6LcqgtEqAAAAAJMJFyRL-4U-H8yvJO9CZyMxPG5D"
                        onChange={onReCAPTCHAChange}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="privacy_consent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I agree to the Privacy Policy
                            </FormLabel>
                            <FormDescription>
                              By checking this box, you consent to MyAdvisor.sg collecting, using, and disclosing your personal data as described in our Privacy Policy for the purpose of contacting you about financial advisory services.
                            </FormDescription>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isSubmitting || !recaptchaToken}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Request'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="text-center border-t pt-6 text-blue-900">
                <p className="text-sm w-full">
                  © 2025 MyAdvisor.sg. All rights reserved.
                </p>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}