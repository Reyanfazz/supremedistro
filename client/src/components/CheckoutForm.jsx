import React, { useState, useEffect } from "react";
import {
  useStripe,
  useElements,
  CardElement,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import axios from "axios";

const CheckoutForm = ({ totalAmount, items, shippingAddress, navigate }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentRequest, setPaymentRequest] = useState(null);

  // ✅ Google / Apple Pay setup
  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: "GB",
      currency: "gbp",
      total: { label: "Total", amount: Math.round(totalAmount * 100) },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) setPaymentRequest(pr);
    });

    pr.on("paymentmethod", async (ev) => {
      setLoading(true);
      try {
        const { data } = await axios.post("/create-payment-intent", {
          amount: totalAmount * 100,
        });
        const clientSecret = data.clientSecret;

        const { error: confirmError, paymentIntent } =
          await stripe.confirmCardPayment(clientSecret, {
            payment_method: ev.paymentMethod.id,
          });

        if (confirmError) {
          ev.complete("fail");
          setError(confirmError.message);
        } else if (paymentIntent.status === "succeeded") {
          ev.complete("success");

          // ✅ Save order to DB
          await axios.post("/api/orders", {
            products: items.map((i) => ({
              product: i._id,
              quantity: i.quantity,
            })),
            totalAmount,
            shippingAddress,
            paymentMethod: "Apple/Google Pay",
          });

          alert("Payment successful!");
          navigate("/orders");
        }
      } catch (err) {
        ev.complete("fail");
        setError(err.response?.data?.message || err.message);
      }
      setLoading(false);
    });
  }, [stripe, totalAmount, items, shippingAddress, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post("/create-payment-intent", {
        amount: totalAmount * 100,
      });
      const clientSecret = data.clientSecret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        // ✅ Save order to DB
        await axios.post("/api/orders", {
          products: items.map((i) => ({
            product: i._id,
            quantity: i.quantity,
          })),
          totalAmount,
          shippingAddress,
          paymentMethod: "Card",
        });

        alert("Payment successful!");
        navigate("/orders");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold">Card Payment</h2>
        <CardElement className="p-3 border rounded" />
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-yellow-400 text-black py-2 rounded hover:bg-yellow-500"
        >
          {loading ? "Processing..." : `Pay £${totalAmount.toFixed(2)}`}
        </button>
      </form>

      {paymentRequest && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Google / Apple Pay</h2>
          <PaymentRequestButtonElement options={{ paymentRequest }} />
        </div>
      )}
    </div>
  );
};

export default CheckoutForm;
