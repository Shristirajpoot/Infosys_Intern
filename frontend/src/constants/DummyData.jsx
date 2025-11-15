const stats = [
  { label: 'Total Weight Recycled', value: '1,250 kg', period: 'This month', icon: 'Trash2' },
  { label: 'Carbon Offset', value: '2.5 Tons', period: 'Equivalent to 12 trees', icon: 'BarChart3' },
  { label: 'Pickups Completed', value: '18', period: 'Since joining', icon: 'CheckCircle' }
];

const opportunities = [
  {
    title: 'Riverside Clean-up Drive',
    organization: 'Green Earth Alliance',
    tags: ['Teamwork', 'Manual Labor', 'Environmental Awareness'],
    duration: '4 hours',
    imageUrl: 'https://placehold.co/600x400/34D399/FFFFFF?text=Clean-Up'
  },
  {
    title: 'Recycling Center Support',
    organization: 'Urban Recyclers',
    tags: ['Organization', 'Attention to Detail'],
    duration: 'Full day',
    imageUrl: 'https://placehold.co/600x400/60A5FA/FFFFFF?text=Recycling'
  },
  {
    title: 'Waste Education Outreach',
    organization: 'Eco-Innovate',
    tags: ['Public Speaking', 'Education'],
    duration: '2 hours/week',
    imageUrl: 'https://placehold.co/600x400/FBBF24/FFFFFF?text=Education'
  }
];

const pickups = [
    { date: 'Oct 26, 2024 at 10:00 AM', type: 'Mixed Recyclables', status: 'Pending' },
    { date: 'Nov 01, 2024 at 02:00 PM', type: 'E-waste', status: 'Pending' },
    { date: 'Nov 15, 2024 at 09:30 AM', type: 'Organic Waste', status: 'Pending' }
];

const notifications = [
    { icon: 'PackageCheck', text: 'Your pickup for Oct 12 has been completed successfully!', time: '3 hours ago', color: 'green' },
    { icon: 'PackageCheck', text: "New opportunity: 'Park Beautification' is available.", time: 'Yesterday', color: 'green' },
    { icon: 'CheckCircle', text: 'Reminder: Recycling center support this Saturday.', time: '2 days ago', color: 'yellow' }
];

const tagColors = {
    'Teamwork': 'bg-blue-100 text-blue-800',
    'Manual Labor': 'bg-yellow-100 text-yellow-800',
    'Environmental Awareness': 'bg-green-100 text-green-800',
    'Organization': 'bg-purple-100 text-purple-800',
    'Attention to Detail': 'bg-indigo-100 text-indigo-800',
    'Public Speaking': 'bg-pink-100 text-pink-800',
    'Education': 'bg-teal-100 text-teal-800',
};
const opportunitiesData = [
  {
    id: 1,
    title: 'Electronics Recycling Drive',
    description: 'Collect old electronics for proper recycling',
    status: 'Active',
    category: 'Electronics',
    location: 'Downtown Community Center',
    date: 'Mon, Sep 15',
    participants: 23,
    capacity: 50,
  },
  {
    id: 2,
    title: 'Beach Cleanup Initiative',
    description: 'Help clean up the coastline and protect marine life',
    status: 'Active',
    category: 'Environmental',
    location: 'Sunset Beach',
    date: 'Mon, Sep 22',
    participants: 78,
    capacity: 100,
  },
  {
    id: 3,
    title: 'Paper Recycling Workshop',
    description: 'Learn about paper recycling and create recycled paper crafts',
    status: 'Full',
    category: 'Education',
    location: 'Green Library',
    date: 'Mon, Sep 8',
    participants: 30,
    capacity: 30,
  },
];
export { stats, opportunities, pickups, notifications, tagColors, opportunitiesData };
