import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
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

// ✅ Country mapping (expand as needed)
const COUNTRY_CODES = {
  India: "IN",
  UnitedKingdom: "GB",
  USA: "US",
  Egypt: "EG",
  Germany: "DE",
  France: "FR",
};

const CheckoutForm = ({ totalAmount, items, shippingAddress, navigate, isShippingValid }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [walletSupported, setWalletSupported] = useState(true);

  // Get 2-letter country code
  const countryCode = COUNTRY_CODES[shippingAddress.country] || "GB";

  // ✅ Setup Payment Request (Apple Pay / Google Pay)
  useEffect(() => {
    if (!stripe || !isShippingValid) return;

    const pr = stripe.paymentRequest({
      country: countryCode,
      currency: "gbp",
      total: { label: "SupremeDistro", amount: Math.round(totalAmount * 100) },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) setPaymentRequest(pr);
      else setWalletSupported(false);
    });

    pr.on("paymentmethod", async (ev) => {
      setLoading(true);
      setErrorMessage("");

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/payment/create-payment-intent`,
          { amount: Math.round(totalAmount * 100), shippingAddress, items },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        const confirm = await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: ev.paymentMethod.id,
          shipping: {
            name: shippingAddress.name,
            address: {
              line1: shippingAddress.address,
              city: shippingAddress.city,
              postal_code: shippingAddress.postalCode,
              country: countryCode,
            },
          },
        });

        if (confirm.error) {
          ev.complete("fail");
          setErrorMessage(confirm.error.message);
        } else if (confirm.paymentIntent.status === "succeeded") {
          ev.complete("success");
          navigate("/success");
        }
      } catch (err) {
        console.error(err);
        ev.complete("fail");
        setErrorMessage("Payment failed. Please try again.");
      } finally {
        setLoading(false);
      }
    });
  }, [stripe, totalAmount, shippingAddress, items, navigate, isShippingValid, countryCode]);

  // ✅ Handle Card Payment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !isShippingValid) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/create-payment-intent`,
        { amount: Math.round(totalAmount * 100), shippingAddress, items },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: shippingAddress.name,
            email: shippingAddress.email,
            phone: shippingAddress.phone,
            address: {
              line1: shippingAddress.address,
              city: shippingAddress.city,
              postal_code: shippingAddress.postalCode,
              country: countryCode,
            },
          },
        },
      });

      if (result.error) setErrorMessage(result.error.message);
      else if (result.paymentIntent.status === "succeeded") navigate("/success");
    } catch (err) {
      console.error(err);
      setErrorMessage("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Payment Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Card Payment</h3>

        <div className="grid grid-cols-1 gap-3">
          <div className="border rounded-lg p-3 shadow-sm">
            <label className="block text-sm mb-1">Card Number</label>
            <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-lg p-3 shadow-sm">
              <label className="block text-sm mb-1">Expiry Date</label>
              <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
            </div>
            <div className="border rounded-lg p-3 shadow-sm">
              <label className="block text-sm mb-1">CVC</label>
              <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>
        </div>

        {errorMessage && <p className="text-red-600 text-sm mt-1">{errorMessage}</p>}

        <button
          type="submit"
          disabled={!stripe || loading || !isShippingValid}
          className="w-full mt-4 bg-yellow-400 text-black font-semibold py-3 rounded-lg hover:bg-yellow-500 transition disabled:opacity-50"
        >
          {loading ? "Processing..." : `Pay £${totalAmount.toFixed(2)}`}
        </button>
      </div>

      {/* Wallet Payment (Apple Pay / Google Pay) */}
      {isShippingValid && paymentRequest && (
        <div className="mt-6">
          <h3 className="font-semibold text-lg">Pay with Wallet</h3>
          <div className="border rounded-lg p-3 shadow-sm flex justify-center">
            <PaymentRequestButtonElement
              options={{
                paymentRequest,
                style: { paymentRequestButton: { theme: "dark", height: "48px" } },
              }}
            />
          </div>
        </div>
      )}

      {/* Wallet Unsupported Warning */}
      {!walletSupported && isShippingValid && (
        <p className="text-red-600 mt-2 text-sm">
          Apple Pay / Google Pay is not supported on this device/browser.
        </p>
      )}

      {/* Shipping Info Not Valid Warning */}
      {!isShippingValid && (
        <p className="text-red-600 mt-2 text-sm">
          Fill all shipping fields to enable payment.
        </p>
      )}
    </form>
  );
};

export default CheckoutForm;
