import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Razorpay type declaration
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PlanFeature {
  included: boolean;
  text: string;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  features: PlanFeature[];
  buttonText: string;
  popular?: boolean;
  disabled?: boolean;
}

export default function Subscription() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Define pricing plans
  const plans: PricingPlan[] = [
    {
      id: "student",
      name: "Student",
      price: 499,
      duration: "per month",
      description: "Perfect for students and educational use",
      features: [
        { included: true, text: "Basic phishing URL detection" },
        { included: true, text: "File scanning (up to 10 MB)" },
        { included: true, text: "Code vulnerability scanning (basic)" },
        { included: false, text: "Advanced threat detection" },
        { included: false, text: "Batch file scanning" },
        { included: false, text: "Developer mode access" },
        { included: false, text: "Priority support" }
      ],
      buttonText: "Start Free Trial"
    },
    {
      id: "professional",
      name: "Professional",
      price: 1499,
      duration: "per month",
      description: "Ideal for professionals and small businesses",
      features: [
        { included: true, text: "Advanced phishing URL detection" },
        { included: true, text: "File scanning (up to 50 MB)" },
        { included: true, text: "Code vulnerability scanning (advanced)" },
        { included: true, text: "Advanced threat detection" },
        { included: true, text: "Batch file scanning" },
        { included: false, text: "Developer mode access" },
        { included: false, text: "Priority support" }
      ],
      buttonText: "Subscribe Now",
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 4999,
      duration: "per month",
      description: "Full security suite for organizations",
      features: [
        { included: true, text: "Enterprise-grade phishing detection" },
        { included: true, text: "File scanning (unlimited)" },
        { included: true, text: "Code vulnerability scanning (premium)" },
        { included: true, text: "Advanced threat detection" },
        { included: true, text: "Batch file scanning" },
        { included: true, text: "Developer mode access" },
        { included: true, text: "Priority support" }
      ],
      buttonText: "Contact Sales"
    }
  ];

  const handleSubscription = async (plan: PricingPlan) => {
    try {
      setIsLoading(true);
      
      // In a real implementation, we would make a call to our backend to create an order
      const orderResponse = await fetch('/api/subscription/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          amount: plan.price * 100, // amount in paise
        }),
      });
      
      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }
      
      const orderData = await orderResponse.json();
      
      if (!window.Razorpay) {
        // Load Razorpay script if not already loaded
        await loadRazorpayScript();
      }
      
      // Create Razorpay payment options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || orderData.key_id, // Get key from environment or order response
        amount: plan.price * 100, // amount in smallest currency unit
        currency: 'INR',
        name: 'NetGuardian Security',
        description: `${plan.name} Plan Subscription`,
        order_id: orderData.id,
        handler: function(response: any) {
          verifyPayment(response, orderData);
        },
        prefill: {
          name: 'John Doe',
          email: 'john@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#3399cc',
        },
      };
      
      // Initialize Razorpay
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Subscription Failed',
        description: 'There was an error processing your subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      document.body.appendChild(script);
    });
  };
  
  const verifyPayment = async (paymentResponse: any, orderData: any) => {
    try {
      const verifyResponse = await fetch('/api/subscription/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          orderData,
        }),
      });
      
      if (!verifyResponse.ok) {
        throw new Error('Payment verification failed');
      }
      
      const verifyData = await verifyResponse.json();
      
      toast({
        title: 'Subscription Successful',
        description: 'Your subscription has been activated successfully.',
        variant: 'default',
      });
      
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: 'Payment Verification Failed',
        description: 'There was an error verifying your payment. Please contact support.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="bg-background-surface rounded-lg shadow-lg p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-text-primary mb-2">Choose Your Security Plan</h2>
        <p className="text-text-secondary">Select the plan that best fits your security needs</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`relative ${plan.popular ? 'transform md:-translate-y-4' : ''}`}>
            {plan.popular && (
              <div className="absolute top-0 inset-x-0 transform -translate-y-6">
                <span className="bg-primary text-white text-xs font-bold py-1 px-3 rounded-full inline-block">MOST POPULAR</span>
              </div>
            )}
            
            <Card className={`h-full flex flex-col overflow-hidden ${
              plan.popular 
                ? 'border-primary shadow-lg' 
                : 'border-background-elevated'
            }`}>
              <div className="p-6 flex-grow">
                <h3 className="text-xl font-bold text-text-primary mb-1">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-text-primary">₹{plan.price}</span>
                  <span className="text-text-secondary text-sm ml-1">{plan.duration}</span>
                </div>
                <p className="text-text-secondary mb-6">{plan.description}</p>
                
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-status-success flex-shrink-0 mr-2" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-text-disabled flex-shrink-0 mr-2" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-text-primary' : 'text-text-disabled'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 bg-background-card">
                <Button 
                  onClick={() => handleSubscription(plan)}
                  className={`w-full ${plan.popular ? 'bg-primary' : ''}`} 
                  variant={plan.popular ? "default" : "outline"}
                  disabled={isLoading}
                >
                  {plan.buttonText}
                </Button>
              </div>
            </Card>
          </div>
        ))}
      </div>
      
      <div className="mt-10 text-center">
        <p className="text-text-secondary text-sm">
          All plans include a 7-day free trial. No credit card required.
        </p>
        <p className="text-text-secondary text-sm mt-1">
          Secure payments processed by <span className="font-medium">Razorpay</span>
        </p>
      </div>
    </div>
  );
}