// src/pages/Checkout.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import CheckoutForm from "../components/CheckoutForm";
import axios from "axios";

const stripePromise = loadStripe(
  "pk_test_51RyYZlDRHCTuYejoiGEiQOXvzlsamfcmj17tK4xi8xMzFlZirhgdtF0F3aYD7HfPTNfGZHfhvVxjM1jzsyv2Y3eg00QFfWAuEQ"
);

const Checkout = () => {
  const location = useLocation();
  const items = useMemo(() => location.state?.items || [], [location.state]);

  // ✅ Load saved address from localStorage
  const [shippingAddress, setShippingAddress] = useState(() => {
    const saved = localStorage.getItem("shippingAddress");
    return saved
      ? JSON.parse(saved)
      : {
          name: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          postalCode: "",
          country: "",
        };
  });

  const [saveAddress, setSaveAddress] = useState(false);

  const handleAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (saveAddress) {
      localStorage.setItem("shippingAddress", JSON.stringify(shippingAddress));
    }
  }, [saveAddress, shippingAddress]);

  // ✅ Subtotal
  const subtotal = useMemo(() => {
    return items.reduce(
      (acc, i) =>
        acc +
        ((i.offSalePrice ||
          i.product?.offSalePrice ||
          i.dailyPrice ||
          i.product?.dailyPrice) *
          i.quantity),
      0
    );
  }, [items]);

  // ✅ Savings only if product has dealOfTheDay
  const savings = useMemo(() => {
    return items
      .filter((i) => i.dealOfTheDay || i.product?.isDealOfDay)
      .reduce(
        (acc, i) =>
          acc +
          ((i.offSalePrice ||
            i.product?.offSalePrice ||
            i.dailyPrice ||
            i.product?.dailyPrice) *
            i.quantity *
            0.1),
        0
      );
  }, [items]);

  // ✅ 20% Tax
  const tax = subtotal * 0.2;

  // ✅ Total = subtotal - savings + tax
  const totalAmount = subtotal + tax - savings;

  if (!items.length) {
    return <p className="text-center mt-10">No items to checkout</p>;
  }

  // ✅ Save order after PayPal payment
  const handlePayPalSuccess = async (details) => {
    try {
      await axios.post("/api/orders", {
        products: items.map((i) => ({
          product: i._id || i.product?._id,
          quantity: i.quantity,
        })),
        shippingAddress,
        totalAmount,
        paymentMethod: "PayPal",
      });

      alert(`Payment successful! Transaction ID: ${details.id}`);
      window.location.href = "/";
    } catch (err) {
      console.error("Order saving failed:", err);
      alert("Payment done, but order saving failed.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4 py-8 flex flex-col lg:flex-row gap-8">
      {/* Left Side: Address + Order Summary */}
      <div className="flex-1 space-y-6">
        {/* Shipping Address */}
        <div className="bg-white border rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              "name",
              "email",
              "phone",
              "address",
              "city",
              "postalCode",
              "country",
            ].map((field) => (
              <input
                key={field}
                type="text"
                name={field}
                value={shippingAddress[field]}
                onChange={handleAddressChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className="w-full p-2 border rounded"
                required
              />
            ))}
          </div>
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="saveAddress"
              checked={saveAddress}
              onChange={(e) => setSaveAddress(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="saveAddress" className="text-sm">
              Save this address for next time
            </label>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white border rounded-lg p-6 shadow-md">
          <h1 className="text-2xl font-semibold mb-4">Order Summary</h1>

          {items.map(item => (
  <div
    key={item._id}
    className="flex items-center justify-between mb-3 border-b pb-2"
  >
    {/* Product Image */}
    <img
      src={`${import.meta.env.VITE_API_URL}/uploads/${item.image}`}
      alt={item.name}
      className="w-16 h-16 object-cover rounded mr-3 border"
    />

    {/* Product Details */}
    <div className="flex-1">
      <p className="font-medium">{item.name} × {item.quantity}</p>
    </div>

    {/* Price */}
    <span className="font-semibold">
      ₹{((item.offSalePrice || item.dailyPrice) * item.quantity).toFixed(2)}
    </span>
  </div>
))}

          <hr className="my-2" />

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>£{subtotal.toFixed(2)}</span>
          </div>

          {savings > 0 && (
            <div className="flex justify-between text-green-600">
              <span>You Save</span>
              <span>-£{savings.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Tax (20%)</span>
            <span>£{tax.toFixed(2)}</span>
          </div>

          <hr className="my-2" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>£{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Right Side: Payment */}
      <div className="w-full lg:w-1/3 bg-white border rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Payment</h2>

        {/* Stripe Payment */}
        <Elements stripe={stripePromise}>
          <CheckoutForm
            totalAmount={totalAmount}
            items={items}
            shippingAddress={shippingAddress}
          />
        </Elements>

        <hr className="my-6" />

        {/* PayPal Payment */}
        <PayPalScriptProvider
          options={{ "client-id": "YOUR_PAYPAL_CLIENT_ID", currency: "GBP" }}
        >
          <PayPalButtons
            style={{ layout: "vertical" }}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: totalAmount.toFixed(2),
                      currency_code: "GBP",
                    },
                  },
                ],
              });
            }}
            onApprove={(data, actions) => {
              return actions.order.capture().then((details) => {
                handlePayPalSuccess(details);
              });
            }}
            onError={(err) => {
              console.error("PayPal error:", err);
              alert("PayPal payment failed.");
            }}
          />
        </PayPalScriptProvider>
      </div>
    </div>
  );
};

export default Checkout;
