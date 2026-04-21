import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Check, Loader2, Package } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (sessionId) pollStatus(0);
  }, [sessionId]); // eslint-disable-line

  const pollStatus = async (attempt) => {
    if (attempt >= 5) { setPolling(false); return; }
    try {
      const { data } = await axios.get(`${API}/api/checkout/status/${sessionId}`, { withCredentials: true });
      setStatus(data);
      if (data.payment_status === 'paid') { setPolling(false); return; }
      if (data.status === 'expired') { setPolling(false); return; }
      setTimeout(() => pollStatus(attempt + 1), 2000);
    } catch (err) {
      console.error(err);
      setTimeout(() => pollStatus(attempt + 1), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-6" data-testid="checkout-success-page">
      <div className="max-w-md w-full text-center">
        {polling ? (
          <div>
            <Loader2 size={48} className="animate-spin text-[#8B6914] mx-auto mb-6" />
            <h1 className="font-heading text-2xl text-[#1A1A1A] mb-3">Processing Payment...</h1>
            <p className="text-sm text-[#6B6B6B]">Please wait while we confirm your payment.</p>
          </div>
        ) : status?.payment_status === 'paid' ? (
          <div data-testid="payment-success">
            <div className="w-16 h-16 mx-auto mb-6 border-2 border-green-500 flex items-center justify-center">
              <Check size={32} className="text-green-500" />
            </div>
            <h1 className="font-heading text-3xl text-[#1A1A1A] mb-3">Payment Successful</h1>
            <p className="text-sm text-[#6B6B6B] mb-2">Thank you for your order!</p>
            <p className="text-xs text-[#999] mb-8">Amount: ${(status.amount_total / 100).toFixed(2)} {status.currency?.toUpperCase()}</p>
            <div className="flex gap-4 justify-center">
              <Link to="/orders">
                <Button className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none" data-testid="view-orders-btn">
                  <Package size={16} className="mr-2" /> View Orders
                </Button>
              </Link>
              <Link to="/shop">
                <Button variant="outline" className="border-[#E8E4DD] text-[#6B6B6B] rounded-none">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div data-testid="payment-pending">
            <h1 className="font-heading text-2xl text-[#1A1A1A] mb-3">Payment Status</h1>
            <p className="text-sm text-[#6B6B6B] mb-6">
              {status?.status === 'expired' ? 'Payment session expired.' : 'Payment is being processed. Check your orders for updates.'}
            </p>
            <Link to="/orders"><Button className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none">View Orders</Button></Link>
          </div>
        )}
      </div>
    </div>
  );
}
