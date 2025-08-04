import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, Wallet, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/api-utils';

const RAZORPAY_KEY_ID = 'rzp_test_T080NI7RBa9TQp';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RazorpayPayment({ recharge, setRecharge }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [razorpayResponse, setRazorpayResponse] = useState(null);
  const [token, setToken] = useState(null);
  const [student, setStudent] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const rawStudent = localStorage.getItem('student');
    const parsedStudent = rawStudent ? JSON.parse(rawStudent) : null;

    if (!storedToken || !parsedStudent?.studentId) {
      router.push('/student/login');
      return;
    }

    setToken(storedToken);
    setStudent(parsedStudent);
  }, [router]);

  const payNow = async () => {
    setMessage('');
    setMessageType('info');
    const paymentAmount = parseFloat(amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setMessage('Please enter a valid amount.');
      setMessageType('error');
      return;
    }

    setLoading(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setMessage('Failed to load Razorpay SDK. Please try again.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const order = await post(
        '/create-order-hostel-recharge',
        {
          amount: paymentAmount,
          studentId: student?.studentId || null,
          adminName: student?.adminuser || null,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: {},
        },
        token
      );

      if (!order.order_id) {
        setMessage('Failed to create order. Please try again.');
        setMessageType('error');
        setLoading(false);
        return;
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'eSamwad Hostel',
        description: 'Hostel Recharge',
        order_id: order.order_id,
        handler: async function (response) {
          setRazorpayResponse({
            ...response,
            amount: paymentAmount,
          });

          try {
            const verifyPaymentResponse = await post(
              '/verify-payment-hostel-recharge',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                studentId: student?.studentId || null,
                adminName: student?.adminuser || null,
                amount: order.amount,
                studentName: student?.studentName || '',
              },
              token
            );

            if (verifyPaymentResponse.status === 'ok') {
              setMessage('Payment verified successfully!');
              setPaymentSuccess(true);
              setRecharge(false);
            } else {
              setMessage('Payment verification failed.');
              setMessageType('error');
            }
          } catch (verifyError) {
            setMessage(verifyError.message || 'Error verifying payment.');
            setMessageType('error');
          }
        },
        prefill: {
          name: student?.studentName || 'Student',
          email: 'student@example.com',
          contact: '9999999999',
        },
        theme: { color: '#4F46E5' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      const errorMessage = error.message || 'Error initiating payment. Please try again.';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={recharge} onOpenChange={setRecharge}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="text-center">
            <Wallet className="h-12 w-12 text-primary mx-auto mb-2" />
            <DialogTitle className="text-3xl font-bold">Online Payment</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Enter the amount you wish to recharge.
            </DialogDescription>
          </div>
          <div className="space-y-4 mt-4">
            <Input
              type="number"
              placeholder="Enter amount in ₹"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.01"
              className="h-12 bg-background/50 text-base font-medium placeholder:text-muted-foreground/60"
            />
            {message && (
              <Alert variant={messageType === 'error' ? 'destructive' : 'default'}>
                <AlertTitle>{messageType === 'error' ? 'Error' : 'Info'}</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </div>
          <div className="mt-6">
            <Button onClick={payNow} disabled={loading || !token} className="w-full h-12 text-lg font-semibold">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Pay Now'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentSuccess} onOpenChange={setPaymentSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Payment Successful!
            </DialogTitle>
            <DialogDescription>
              Your transaction for ₹{razorpayResponse?.amount} has been completed successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <p>
              <strong>Payment ID:</strong> {razorpayResponse?.razorpay_payment_id}
            </p>
            <p>
              <strong>Order ID:</strong> {razorpayResponse?.razorpay_order_id}
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setPaymentSuccess(false);
                setAmount('');
                setMessage('');
                setMessageType('info');
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
