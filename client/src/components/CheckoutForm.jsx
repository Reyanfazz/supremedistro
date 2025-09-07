import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  CardElement,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import axios from "axios";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#32325d",
      fontFamily: "Arial, sans-serif",
      "::placeholder": { color: "#a0aec0" },
    },
    invalid: { color: "#e53e3e" },
  },
};

const CheckoutForm = ({ totalAmount, items, shippingAddress, navigate }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState(null);

  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: "GB",
      currency: "gbp",
      total: { label: "SupremeDistro", amount: Math.round(totalAmount * 100) },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    // Only set if wallet is supported
    pr.canMakePayment().then((result) => {
      if (result) setPaymentRequest(pr);
    });
  }, [stripe, totalAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    try {
      const metadataItems = items.map((i) => i.name).join(",").slice(0, 500);

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/create-payment-intent`,
        { amount: Math.round(totalAmount * 100), shippingAddress, metadataItems, items }
      );

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: shippingAddress.name,
            email: shippingAddress.email,
            phone: shippingAddress.phone,
          },
        },
        // ✅ Enable Stripe Link auto-fill
        link: { enabled: true },
      });

      if (result.error) {
        alert(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        navigate("/success");
      }
    } catch (err) {
      console.error(err);
      alert("Payment failed. Try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Payment */}
      <div>
        <h3 className="font-semibold mb-2">Card Payment</h3>
        <div className="border rounded-lg p-3 shadow-sm">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <button
          type="submit"
          disabled={!stripe}
          className="w-full mt-4 bg-yellow-400 text-black font-semibold py-3 rounded-lg hover:bg-yellow-500 transition"
        >
          Pay £{totalAmount.toFixed(2)}
        </button>
      </div>

      {/* Wallet Payment */}
      {paymentRequest && (
        <div>
          <h3 className="font-semibold mb-2">Pay with Wallet</h3>
          <div className="border rounded-lg p-3 shadow-sm flex justify-center">
            <PaymentRequestButtonElement
              options={{
                paymentRequest,
                style: {
                  paymentRequestButton: {
                    theme: "dark",
                    height: "48px",
                    type: "default",
                  },
                },
              }}
            />
          </div>
        </div>
      )}
    </form>
  );
};

export default CheckoutForm;
