// Frontend/src/pages/BookingConfirmation.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
// Assuming API utility is in a services directory
import API from '../services/api'; 
// Assuming you have components for displaying UI state
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'; 
import { Loader2, CheckCircle, XCircle } from 'lucide-react'; 
import { toast } from 'sonner';

const BookingConfirmation = ({ onPaymentConfirmed }) => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('Verifying...');
    const [message, setMessage] = useState('Fetching final status from payment gateway...');

    // Cashfree appends order_id to the return_url
    const orderId = searchParams.get('order_id'); 

    useEffect(() => {
        if (!orderId) {
            setStatus('Error');
            setMessage('Order ID not found in URL. Please check your transaction history.');
            toast.error("Invalid payment link.");
            return;
        }

        const verifyPayment = async () => {
            try {
                // Call your backend verification endpoint /payments/verify/:orderId
                const response = await API.get(`/payments/verify/${orderId}`); 
                
                if (response.data.success) {
                    setStatus('Success');
                    setMessage(`Your purchase is confirmed! Order ID: ${orderId}. You will be redirected shortly.`);
                    toast.success("Payment successful! Booking confirmed.");

                    // Optional: Call a global action/context function if needed
                    if (onPaymentConfirmed) onPaymentConfirmed(response.data.booking);

                    // Redirect the user to their dashboard or session page after a delay
                    setTimeout(() => {
                        window.location.replace('/dashboard/client/my-sessions');
                    }, 4000);

                } else {
                    setStatus('Failure');
                    setMessage(`Payment failed or is still pending. ${response.data.message}`);
                    toast.error("Payment failed. Please try again.");
                }
            } catch (error) {
                console.error("Verification API Error:", error);
                setStatus('Failure');
                setMessage('Could not verify payment status with the server. Please contact support.');
                toast.error("Server error during verification.");
            }
        };

        verifyPayment();
    }, [orderId, onPaymentConfirmed]);

    const getStatusIcon = (currentStatus) => {
        switch (currentStatus) {
            case 'Success':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'Failure':
            case 'Error':
                return <XCircle className="h-5 w-5 text-red-600" />;
            default:
                return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
        }
    };

    const getStatusVariant = (currentStatus) => {
        switch (currentStatus) {
            case 'Success':
                return "bg-green-50 border-green-400";
            case 'Failure':
            case 'Error':
                return "bg-red-50 border-red-400";
            default:
                return "bg-blue-50 border-blue-400";
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-xl mt-20">
            <h1 className="text-3xl font-heading font-bold text-center mb-10">Payment Confirmation</h1>
            
            <Alert className={getStatusVariant(status)}>
                {getStatusIcon(status)}
                <AlertTitle className="font-semibold text-lg">{status}</AlertTitle>
                <AlertDescription className="text-base">{message}</AlertDescription>
            </Alert>
            
            {(status === 'Failure' || status === 'Error') && (
                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground mb-4">If funds were deducted, please wait for a few minutes and check your account, or contact support with your Order ID: **{orderId}**.</p>
                    <Button variant="outline" onClick={() => window.location.replace('/profiles')}>
                        Back to Coaches
                    </Button>
                </div>
            )}
        </div>
    );
};

export default BookingConfirmation;