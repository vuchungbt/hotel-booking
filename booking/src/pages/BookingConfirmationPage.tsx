import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Users, DollarSign, Download, Share2, Phone, Mail } from 'lucide-react';
import { bookingAPI, BookingResponse } from '../services/api';

const BookingConfirmationPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id]);

  const fetchBooking = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await bookingAPI.getMyBookingById(id);
      setBooking(response.data.result);
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      setError(error.response?.data?.message || 'Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = () => {
    if (navigator.share && booking) {
      navigator.share({
        title: 'Hotel Booking Confirmation',
        text: `I've booked ${booking.hotelName} for ${booking.numberOfNights} nights!`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Booking link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading booking confirmation...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-red-500 text-lg font-semibold mb-2">
              {error || 'Booking not found'}
            </div>
            <button
              onClick={() => navigate('/bookings')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your reservation has been successfully created</p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-blue-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">{booking.hotelName}</h2>
                <div className="flex items-center text-blue-100">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{booking.hotelAddress}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-blue-100 text-sm">Booking Reference</div>
                <div className="text-xl font-bold">{booking.bookingReference}</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600 mb-1">Check-in</div>
                <div className="font-semibold">{formatDate(booking.checkInDate)}</div>
              </div>
              <div className="text-center">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600 mb-1">Check-out</div>
                <div className="font-semibold">{formatDate(booking.checkOutDate)}</div>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600 mb-1">Guests</div>
                <div className="font-semibold">{booking.guests} Guest{booking.guests > 1 ? 's' : ''}</div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Room Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Type:</span>
                      <span className="font-medium">{booking.roomTypeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bed Type:</span>
                      <span className="font-medium">{booking.bedType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Occupancy:</span>
                      <span className="font-medium">{booking.maxOccupancy} guests</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nights:</span>
                      <span className="font-medium">{booking.numberOfNights}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Guest Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{booking.guestName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{booking.guestEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{booking.guestPhone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {booking.specialRequests && (
              <div className="border-t pt-6 mt-6">
                <h3 className="font-semibold mb-2">Special Requests</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{booking.specialRequests}</p>
              </div>
            )}

            <div className="border-t pt-6 mt-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                  <div className="text-2xl font-bold text-blue-600">${booking.totalAmount}</div>
                  <div className="text-sm text-gray-600">
                    ${booking.pricePerNight} × {booking.numberOfNights} night{booking.numberOfNights > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Payment Status</div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    booking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                    booking.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hotel Contact Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="font-semibold mb-4">Hotel Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm text-gray-600">Phone</div>
                <div className="font-medium">{booking.hotelPhone || 'Not available'}</div>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="font-medium">{booking.hotelEmail || 'Not available'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(`/bookings/${booking.id}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            View Booking Details
          </button>
          <button
            onClick={() => navigate('/bookings')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
          >
            My Bookings
          </button>
          <button
            onClick={handleShare}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
          <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium flex items-center justify-center">
            <Download className="h-4 w-4 mr-2" />
            Download Confirmation
          </button>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-yellow-800 mb-2">Important Information</h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• Please arrive at the hotel with a valid ID and credit card</li>
            <li>• Check-in time is usually after 3:00 PM, check-out before 11:00 AM</li>
            <li>• Contact the hotel directly for any special arrangements</li>
            <li>• Keep your booking reference number for easy check-in</li>
            {booking.paymentStatus === 'PENDING' && (
              <li>• <strong>Payment is still pending. Please complete payment to confirm your booking.</strong></li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage; 