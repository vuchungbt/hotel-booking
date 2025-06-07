import React from 'react';
import { Star } from 'lucide-react';

interface TestimonialProps {
  name: string;
  location: string;
  rating: number;
  comment: string;
  image: string;
}

const testimonials: TestimonialProps[] = [
  {
    name: 'Nguyễn Văn A',
    location: 'Hà Nội',
    rating: 5,
          comment: 'Excellent service, quick and easy booking. I found a great hotel at an affordable price!',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
  },
  {
    name: 'Trần Thị B',
    location: 'TP. Hồ Chí Minh',
    rating: 4,
          comment: 'Very satisfied with the booking experience. Easy-to-use interface with many attractive offers.',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
  },
  {
    name: 'Lê Văn C',
    location: 'Đà Nẵng',
    rating: 5,
          comment: 'Have used the service many times and always satisfied. Quality hotels at reasonable prices.',
    image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg'
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-16 bg-blue-50">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Khách hàng nói gì về chúng tôi</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experiences and reviews from customers who have used our booking service
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialCard: React.FC<{ testimonial: TestimonialProps }> = ({ testimonial }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center mb-4">
        <img 
          src={testimonial.image} 
          alt={testimonial.name} 
          className="w-12 h-12 rounded-full object-cover mr-4"
        />
        <div>
          <h3 className="font-bold">{testimonial.name}</h3>
          <p className="text-sm text-gray-500">{testimonial.location}</p>
        </div>
      </div>
      
      <div className="flex text-amber-400 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={16} 
            fill={i < testimonial.rating ? 'currentColor' : 'none'} 
            stroke={i < testimonial.rating ? 'none' : 'currentColor'}
          />
        ))}
      </div>
      
      <p className="text-gray-700">"{testimonial.comment}"</p>
    </div>
  );
};

export default Testimonials;
