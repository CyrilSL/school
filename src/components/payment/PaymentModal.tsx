"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  installment: {
    id: string;
    installmentNumber: number;
    amount: string;
    dueDate: string;
  };
  onSuccess: (paymentId: string) => void;
}

export default function PaymentModal({ isOpen, onClose, installment, onSuccess }: PaymentModalProps) {
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    upiId: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call the payment API
      const response = await fetch("/api/fees/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          installmentId: installment.id,
          paymentMethod,
          paymentDetails: formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment failed");
      }

      const result = await response.json();
      onSuccess(result.paymentId);
      onClose();
    } catch (error) {
      console.error("Payment error:", error);
      alert(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Pay Installment #{installment.installmentNumber}</span>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Amount to Pay</div>
            <div className="text-2xl font-bold">₹{parseFloat(installment.amount).toLocaleString()}</div>
            <div className="text-sm text-gray-500">Due: {new Date(installment.dueDate).toLocaleDateString()}</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Method Selection */}
            <div>
              <Label>Payment Method</Label>
              <div className="flex space-x-2 mt-2">
                <Button
                  type="button"
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMethod("card")}
                >
                  Card
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "upi" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMethod("upi")}
                >
                  UPI
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "netbanking" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMethod("netbanking")}
                >
                  Net Banking
                </Button>
              </div>
            </div>

            {/* Card Payment Form */}
            {paymentMethod === "card" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    value={formData.cardholderName}
                    onChange={(e) => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
                    required
                  />
                </div>
              </>
            )}

            {/* UPI Payment Form */}
            {paymentMethod === "upi" && (
              <div className="space-y-2">
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  placeholder="yourname@paytm"
                  value={formData.upiId}
                  onChange={(e) => setFormData(prev => ({ ...prev, upiId: e.target.value }))}
                  required
                />
              </div>
            )}

            {/* Net Banking */}
            {paymentMethod === "netbanking" && (
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-blue-800">
                  You will be redirected to your bank's website to complete the payment.
                </p>
              </div>
            )}

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={processing} className="flex-1">
                {processing ? "Processing..." : `Pay ₹${parseFloat(installment.amount).toLocaleString()}`}
              </Button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-800">
              🔒 This is a demo payment system. In production, this would integrate with actual payment gateways like Razorpay, Stripe, or PayU.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}