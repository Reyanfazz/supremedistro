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
  const [walletSupported, setWalletSupported] = useState(false);

  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: "GB",
      currency: "gbp",
      total: { label: "SupremeDistro", amount: Math.round(totalAmount * 100) },
      requestPayerName: true,
      requestPayerEmail: false, // ⚠ do NOT set payerEmail here
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        setWalletSupported(true);
      } else {
        setWalletSupported(false);
      }
    });
  }, [stripe, totalAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    try {
      const metadataItems = JSON.stringify(
        items.map((i) => ({ name: i.name, quantity: i.quantity }))
      ).slice(0, 500); // ⚠ Stripe metadata max 500 chars

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/create-payment-intent`,
        { amount: Math.round(totalAmount * 100), shippingAddress, items, metadataItems }
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
        link: { enabled: true }, // enable Stripe Link auto-fill
      });

      if (result.error) {
        alert(result.error.message);
      } else if (result.paymentIntent?.status === "succeeded") {
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
      <div>
        <h3 className="font-semibold mb-2">Pay with Wallet</h3>
        {walletSupported && paymentRequest ? (
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
        ) : (
          <p className="text-sm text-gray-500">
            Wallet payments (Apple Pay / Google Pay / Stripe Link) are not supported on this device or browser. Please use card payment.
          </p>
        )}
      </div>
    </form>
  );
};

export default CheckoutForm;
