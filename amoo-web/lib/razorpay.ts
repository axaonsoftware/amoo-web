type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (response: any) => void) => void;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  image?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler?: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  modal?: { ondismiss?: () => void };
};

let scriptLoaded = false;
let scriptLoading: Promise<void> | null = null;

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).Razorpay) {
    scriptLoaded = true;
    return Promise.resolve();
  }
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => {
      scriptLoading = null;
      reject(new Error("Failed to load Razorpay checkout script"));
    };
    document.head.appendChild(script);
  });

  return scriptLoading;
}

export function openRazorpayCheckout(options: RazorpayOptions): Promise<{
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}> {
  return new Promise((resolve, reject) => {
    if (typeof (window as any).Razorpay === "undefined") {
      reject(new Error("Razorpay not loaded"));
      return;
    }

    const rzp = new (window as any).Razorpay({
      key: options.key,
      amount: options.amount,
      currency: options.currency,
      name: options.name || "Amoo Guru",
      description: options.description || "",
      image: options.image || "",
      order_id: options.order_id,
      prefill: options.prefill || {},
      theme: options.theme || { color: "#7C3AED" },
      handler(response: any) {
        resolve({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss() {
          reject(new Error("Payment cancelled by user"));
        },
      },
    });

    rzp.open();
  });
}
