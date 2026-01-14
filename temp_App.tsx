import React from 'react';
import { 
  Home, FileText, MessageSquare, Bell, MapPin, PieChart, 
  Menu, Share2, ThumbsUp, Star 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area
} from 'recharts';

const barData = [
  { name: 'JAN', val: 30 }, { name: 'FEB', val: 45 }, { name: 'MAR', val: 35 },
  { name: 'APR', val: 50 }, { name: 'MAY', val: 25 }, { name: 'JUN', val: 75 },
  { name: 'JUL', val: 30 }, { name: 'AUG', val: 60 }, { name: 'SEP', val: 20 },
  { name: 'OCT', val: 45 }, { name: 'NOV', val: 30 }, { name: 'DEC', val: 55 },
];

const areaData = [
  { val: 10 }, { val: 25 }, { val: 15 }, { val: 40 }, { val: 20 }, { val: 50 }, { val: 30 }
];

function App() {
  return (
    <div className='flex min-h-screen bg-bg font-sans'>
      <aside className='w-64 bg-sidebar text-white flex flex-col py-8 px-6'>
        <div className='flex flex-col items-center mb-10'>
          <div className='w-20 h-20 rounded-full bg-white flex items-center justify-center text-4xl mb-4 relative'>
            <div className='absolute inset-0 rounded-full border-4 border-white/20'></div>
            <span className='z-10'>👤</span>
          </div>
          <h2 className='text-xl font-semibold'>JOHN DON</h2>
          <p className='text-xs text-sidebar-text mt-1'>johndon@company.com</p>
        </div>
        <nav className='flex-1 space-y-2'>
          <NavItem icon={<Home size={20} />} text='home' active />
          <NavItem icon={<FileText size={20} />} text='file' />
          <NavItem icon={<MessageSquare size={20} />} text='messages' />
          <NavItem icon={<Bell size={20} />} text='notification' />
          <NavItem icon={<MapPin size={20} />} text='location' />
          <NavItem icon={<PieChart size={20} />} text='graph' />
        </nav>
      </aside>

      <main className='flex-1 p-8'>
        <header className='flex justify-between items-center mb-8'>
          <h1 className='text-2xl text-gray-700 font-light'>Dashboard User</h1>
          <button className='p-2 hover:bg-gray-200 rounded-full'><Menu size={24} /></button>
        </header>

        <div className='grid grid-cols-4 gap-6 mb-8'>
          <Widget title='Earning' value='$ 628' icon='$' dark />
          <Widget title='Share' value='2434' icon={<Share2 size={18} className='text-orange-400' />} />
          <Widget title='Likes' value='1259' icon={<ThumbsUp size={18} className='text-orange-400' />} />
          <Widget title='Rating' value='8,5' icon={<Star size={18} className='text-orange-400' />} />
        </div>

        <div className='grid grid-cols-4 gap-6 h-80 mb-6'>
          <div className='col-span-3 bg-white p-6 rounded-xl shadow-sm relative'>
            <div className='flex justify-between items-start mb-4'>
              <h3 className='text-gray-500 text-sm'>Result</h3>
              <button className='bg-orange-400 text-white text-xs px-3 py-1 rounded-full'>Check Now</button>
            </div>
            <div className='h-60 w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={barData} barSize={12}>
                  <XAxis dataKey='name' tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey='val' radius={[2, 2, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={index} fill={index === 5 ? '#112240' : entry.val % 2 === 0 ? '#1e40af' : '#f59e0b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className='absolute top-[25%] left-[48%] bg-sidebar text-white text-xs py-1 px-2 rounded transform -translate-x-1/2'>
                28.79
              </div>
            </div>
          </div>

          <div className='col-span-1 bg-white p-6 rounded-xl shadow-sm flex flex-col items-center justify-center'>
            <div className='relative w-32 h-32 mb-6'>
              <svg className='w-full h-full transform -rotate-90'>
                <circle cx='64' cy='64' r='56' stroke='#112240' strokeWidth='12' fill='transparent' />
                <circle cx='64' cy='64' r='56' stroke='#f59e0b' strokeWidth='12' fill='transparent' strokeDasharray='351' strokeDashoffset='193' strokeLinecap='round' />
              </svg>
              <div className='absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-700'>45%</div>
            </div>
            <button className='mt-6 bg-orange-400 text-white text-xs px-6 py-2 rounded-full font-medium'>Check Now</button>
          </div>
        </div>

        <div className='grid grid-cols-3 gap-6 h-48'>
          <div className='col-span-2 bg-white p-6 rounded-xl shadow-sm relative overflow-hidden'>
             <div className='h-32 w-full absolute bottom-0 left-0 right-0'>
               <ResponsiveContainer width='100%' height='100%'>
                 <AreaChart data={areaData}>
                   <defs>
                     <linearGradient id='colorVal' x1='0' y1='0' x2='0' y2='1'>
                       <stop offset='5%' stopColor='#f59e0b' stopOpacity={0.8}/>
                       <stop offset='95%' stopColor='#f59e0b' stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <Area type='monotone' dataKey='val' stroke='#112240' fill='url(#colorVal)' strokeWidth={0} fillOpacity={0.4} />
                   <Area type='monotone' dataKey='val' stroke='#f59e0b' fill='transparent' strokeWidth={3} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
          <div className='col-span-1 bg-white p-4 rounded-xl shadow-sm'>
             <div className='grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-600'>
               {[...Array(31)].map((_, i) => (
                 <div key={i+1} className={\p-1 rounded \}>{i+1}</div>
               ))}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, text, active }: { icon: any, text: string, active?: boolean }) {
  return (
    <div className={\lex items-center gap-4 px-4 py-3 cursor-pointer capitalize \}>
      {icon} <span className='font-medium text-sm'>{text}</span>
    </div>
  );
}

function Widget({ title, value, icon, dark }: { title: string, value: string, icon: any, dark?: boolean }) {
  return (
    <div className={\p-5 rounded-lg shadow-sm flex flex-col justify-between h-28 relative \}>
      <div className='flex justify-between items-start'>
        <span className={\	ext-sm font-medium \}>{title}</span>
        <div className={\w-5 h-5 flex items-center justify-center rounded-full \}>{icon}</div>
      </div>
      <div className='text-3xl font-bold'>{value}</div>
    </div>
  );
}

export default App;
