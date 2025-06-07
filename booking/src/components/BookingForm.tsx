import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, CreditCard, MessageSquare, MapPin, Clock, Star } from 'lucide-react';
import { bookingAPI, BookingCreateRequest, HotelResponse, RoomTypeResponse } from '../services/api';

interface BookingFormProps {
  hotel: HotelResponse;
  roomType: RoomTypeResponse;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  onSuccess?: (bookingId: string) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  hotel,
  roomType,
  checkInDate,
  checkOutDate,
  guests,
  onSuccess
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const [formData, setFormData] = useState<BookingCreateRequest>({
    hotelId: hotel.id,
    roomTypeId: roomType.id,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkInDate,
    checkOutDate,
    guests,
    totalAmount: 0,
    paymentMethod: 'CREDIT_CARD',
    specialRequests: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate number of nights and total amount
  const numberOfNights = Math.ceil(
    (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  useEffect(() => {
    const totalAmount = numberOfNights * roomType.pricePerNight;
    setFormData(prev => ({ ...prev, totalAmount }));
  }, [numberOfNights, roomType.pricePerNight]);

  // Check room availability
  useEffect(() => {
    const checkAvailability = async () => {
      setIsChecking(true);
      try {
        const response = await bookingAPI.checkRoomAvailability(
          roomType.id,
          checkInDate,
          checkOutDate
        );
        setIsAvailable(response.data.result);
      } catch (error) {
        console.error('Error checking availability:', error);
        setIsAvailable(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAvailability();
  }, [roomType.id, checkInDate, checkOutDate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.guestName.trim()) {
      newErrors.guestName = 'Guest name is required';
    } else if (formData.guestName.length < 2) {
      newErrors.guestName = 'Guest name must be at least 2 characters';
    }

    if (!formData.guestEmail.trim()) {
      newErrors.guestEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guestEmail)) {
      newErrors.guestEmail = 'Invalid email format';
    }

    if (formData.guestPhone && !/^[+]?[0-9\s\-\(\)]{10,15}$/.test(formData.guestPhone)) {
      newErrors.guestPhone = 'Invalid phone number format';
    }

    if (guests > roomType.maxOccupancy) {
      newErrors.guests = `Maximum occupancy is ${roomType.maxOccupancy} guests`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!isAvailable) {
      alert('Room is not available for the selected dates');
      return;
    }

    setLoading(true);
    try {
      const response = await bookingAPI.createBooking(formData);
      const bookingId = response.data.result.id;
      
      alert('Booking created successfully!');
      
      if (onSuccess) {
        onSuccess(bookingId);
      } else {
        navigate(`/bookings/confirmation/${bookingId}`);
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create booking';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BookingCreateRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isChecking) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Checking availability...</span>
        </div>
      </div>
    );
  }

  if (isAvailable === false) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-8">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Room Not Available
          </div>
          <p className="text-gray-600 mb-4">
            Sorry, this room type is not available for the selected dates.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Booking</h2>

      {/* Hotel & Room Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-start space-x-4">
          <img
            src={roomType.imageUrl || hotel.imageUrl || '/default-hotel.jpg'}
            alt={roomType.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
            <div className="flex items-center text-gray-600 text-sm mb-1">
              <MapPin className="h-4 w-4 mr-1" />
              {hotel.address}
            </div>
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <Star className="h-4 w-4 mr-1 text-yellow-400" />
              {hotel.starRating} Star Hotel
            </div>
            <div className="text-blue-600 font-semibold">{roomType.name}</div>
            <div className="text-sm text-gray-600">
              Max occupancy: {roomType.maxOccupancy} guests | {roomType.bedType}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Check-in</div>
              <div className="font-semibold">{checkInDate}</div>
            </div>
            <div>
              <div className="text-gray-600">Check-out</div>
              <div className="font-semibold">{checkOutDate}</div>
            </div>
            <div>
              <div className="text-gray-600">Guests</div>
              <div className="font-semibold">{guests}</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                ${roomType.pricePerNight} × {numberOfNights} nights
              </span>
              <span className="text-xl font-bold text-blue-600">
                ${formData.totalAmount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Guest Name *
            </label>
            <input
              type="text"
              value={formData.guestName}
              onChange={(e) => handleInputChange('guestName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.guestName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter full name"
            />
            {errors.guestName && (
              <p className="text-red-500 text-sm mt-1">{errors.guestName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.guestEmail}
              onChange={(e) => handleInputChange('guestEmail', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.guestEmail ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email address"
            />
            {errors.guestEmail && (
              <p className="text-red-500 text-sm mt-1">{errors.guestEmail}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.guestPhone}
            onChange={(e) => handleInputChange('guestPhone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.guestPhone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter phone number"
          />
          {errors.guestPhone && (
            <p className="text-red-500 text-sm mt-1">{errors.guestPhone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="DEBIT_CARD">Debit Card</option>
            <option value="PAYPAL">PayPal</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Requests
          </label>
          <textarea
            value={formData.specialRequests}
            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any special requests or notes..."
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !isAvailable}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              `Book Now - $${formData.totalAmount}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm; 