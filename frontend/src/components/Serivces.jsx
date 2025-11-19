import React from 'react';
import { FaRecycle, FaTruck, FaUsers, FaArrowRight } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

const servicesData = [
  {
    imgSrc: '/waste-services1.jpg',
    imgAlt: 'Waste Collection Service',
    icon: FaTruck,
    title: 'Scheduled Pickups',
    description: 'Book waste pickups at your convenience with our smart scheduling system and efficient routes.',
  },
  {
    imgSrc: '/waste-recycling.jpg',
    imgAlt: 'Recycling Services',
    icon: FaRecycle,
    title: 'Recycling Programs',
    description: 'Recycle effectively with our categorized bins and guided disposal programs for homes and businesses.',
  },
  {
    imgSrc: '/waste-services2.jpg',
    imgAlt: 'Community Engagement',
    icon: FaUsers,
    title: 'Community Initiatives',
    description: 'Participate in local cleanup events and workshops to promote sustainability and awareness.',
  },
];

const Services = () => {
  const { isDarkMode } = useTheme();

  return (
    <section
      id="services"
      className={`relative py-20 md:py-28 transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Decorative Background Element */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 bg-emerald-900 opacity-10 rounded-full blur-3xl top-[-100px] left-[-100px]"></div>
        <div className="absolute w-96 h-96 bg-purple-900 opacity-10 rounded-full blur-3xl bottom-[-100px] right-[-100px]"></div>
      </div>

      <div className="container mx-auto px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-sm uppercase tracking-widest text-emerald-500 font-bold mb-3">
            Our Services
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            Built for Impact
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
            We offer smarter, greener ways to manage waste — and involve the community in building a sustainable future.
          </p>
        </div>

        {/* Service Cards */}
        <div className="flex flex-col gap-20">
          {servicesData.map((service, index) => {
            const Icon = service.icon;
            const isEven = index % 2 === 1;

            return (
              <div
                key={index}
                className={`flex flex-col lg:flex-row ${
                  isEven ? 'lg:flex-row-reverse' : ''
                } items-center gap-10 lg:gap-20 group relative transition-transform duration-500 hover:-translate-y-1 hover:shadow-xl`}
              >
                {/* Accent Border Line */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-emerald-400 via-transparent to-purple-400 opacity-10 z-0 hidden lg:block"></div>

                {/* Image */}
                <div className="w-full lg:w-1/2 h-64 lg:h-96 overflow-hidden rounded-xl shadow-xl relative z-10 transform transition-transform duration-500 group-hover:scale-[1.03] group-hover:brightness-110">
                  <img
                    src={service.imgSrc}
                    alt={service.imgAlt}
                    className="w-full h-full object-cover rounded-xl transition-transform duration-500 ease-in-out"
                  />
                  <div className="absolute inset-0 bg-black/10 dark:bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </div>

                {/* Content */}
                <div className="w-full lg:w-1/2 relative z-10">
                  <div className="flex items-center gap-3 mb-4 group/icon">
                    <span className="text-emerald-500 text-2xl transition-transform duration-300 group-hover/icon:scale-125">
                      <Icon />
                    </span>
                    <h3 className="text-2xl font-bold">{service.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
                    {service.description}
                  </p>
                  <button className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold group/link hover:underline">
                    Learn More
                    <FaArrowRight className="ml-2 transition-transform duration-200 group-hover/link:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-24 relative z-10">
          <button className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-purple-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 hover:shadow-xl hover:scale-105">
            View All Services
            <FaArrowRight className="ml-3 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;
